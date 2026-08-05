import type { DatabaseHandle } from "@abp/persistence";
import type { FastifyInstance } from "fastify";
import type { AddressInfo } from "node:net";
import { URL as NodeUrl } from "node:url";
import { apiClient } from "../../http/client.js";

/**
 * `@abp/persistence` (via `db/migrate.ts`) resolve a pasta de migrations com
 * `fileURLToPath(new URL(".", import.meta.url))`, usando o `URL` global — que, sob
 * `@vitest-environment jsdom` (exigido pelos testes de Hook desta Sprint, `renderHook` depende de
 * DOM), é o polyfill de `URL` do próprio jsdom, não a classe nativa do Node; `fileURLToPath` rejeita
 * essa instância ("The URL must be of scheme file"), um problema de compatibilidade de ambiente de
 * teste, não um defeito de `@abp/persistence` (intocado, per proibição desta Sprint). Corrigido
 * apenas neste helper de teste: `globalThis.URL` é temporariamente restaurado à classe nativa do
 * Node antes de importar (dinamicamente, para adiar a avaliação do módulo até este ponto)
 * `@abp/persistence` e o `server.ts` de `apps/api` — nunca alterando nenhum dos dois pacotes.
 */
async function importWithNodeUrl<T>(loader: () => Promise<T>): Promise<T> {
  const original = globalThis.URL;
  globalThis.URL = NodeUrl as unknown as typeof globalThis.URL;
  try {
    return await loader();
  } finally {
    globalThis.URL = original;
  }
}

export interface RealApiServer {
  readonly baseUrl: string;
  close(): Promise<void>;
}

/**
 * Sobe uma instância real de `apps/api` (Fastify + SQLite `:memory:`) em porta efêmera, aponta o
 * `apiClient` singleton (`core/http/client.ts`) para ela via `setBaseUrl` (IMP-204), e devolve um
 * `close()` que encerra tanto o servidor quanto a conexão de banco. Usado exclusivamente por teste
 * de integração real do Supplier Hub — nunca por nenhum componente de produção.
 *
 * `beforeListen`, quando fornecido, recebe a instância já composta (todas as rotas/plugins de
 * `apps/api` já registrados) antes de `fastify.listen` — único ponto em que um teste pode anexar um
 * hook de diagnóstico próprio (ex.: capturar cabeçalhos recebidos, ver `supplierClient.test.ts`,
 * "integração com autenticação"), nunca para alterar rota ou comportamento já existente.
 */
export async function startRealApiServer(beforeListen?: (fastify: FastifyInstance) => void): Promise<RealApiServer> {
  // `fastify.close()` já encerra a DatabaseHandle (hook `onClose` registrado por `managersPlugin`,
  // `apps/api/src/plugins/managers.ts`, intocado) — nenhum fechamento adicional é necessário aqui.
  const fastify = await importWithNodeUrl(async () => {
    const { createDatabase, runMigrations } = await import("@abp/persistence");
    // Import relativo direto ao código-fonte de `apps/api`, nunca ao pacote por nome (`@abp/api`)
    // — `@abp/api/package.json` não declara `exports`, porque `main.ts` é um bootstrapper de
    // processo com efeito colateral (`fastify.listen` + `process.exit`), nunca pensado para ser
    // importado como biblioteca. IMP-204 proíbe qualquer alteração a `apps/api` ("Nenhuma
    // alteração poderá ser feita em: ... HTTP API") — adicionar um `exports` ali contaria como
    // alteração. Este import relativo é o único caminho que satisfaz "executar chamadas HTTP
    // reais... não utilizar mocks" sem tocar em nenhum arquivo de `apps/api`; decisão documentada
    // em `IMP_204_SUPPLIER_FRONTEND_REPORT.md`, Capítulo "Testes". Nunca referenciado por nenhum
    // arquivo de produção — apenas por `*.test.ts`, nunca incluído no bundle de navegador (`vite
    // build`).
    const { buildServer } = await import("../../../../../api/src/server.js");

    const databaseHandle: DatabaseHandle = createDatabase({ environment: "testing", databasePath: ":memory:" });
    runMigrations(databaseHandle);

    return buildServer({ dbHandle: databaseHandle, logger: false });
  });

  beforeListen?.(fastify);
  await fastify.listen({ port: 0, host: "127.0.0.1" });

  const address = fastify.server.address() as AddressInfo | null;
  if (address === null) {
    throw new Error("Não foi possível determinar a porta do servidor de teste real.");
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;
  apiClient.setBaseUrl(baseUrl);
  apiClient.setAccessToken(undefined);

  return {
    baseUrl,
    async close() {
      await fastify.close();
    },
  };
}
