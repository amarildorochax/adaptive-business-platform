import type { DatabaseHandle } from "@abp/persistence";
import type { FastifyInstance } from "fastify";
import type { AddressInfo } from "node:net";
import { URL as NodeUrl } from "node:url";
import { apiClient } from "../../http/client.js";

/**
 * Cópia deliberada de `core/inventory-movement/testing/realApiServer.ts`/
 * `core/purchase/testing/realApiServer.ts`/`core/supplier/testing/realApiServer.ts`
 * (IMP-204/304/404) — o arquivo é inteiramente genérico (sobe todo `apps/api`, não apenas rotas do
 * Production Hub) e por isso permanece um candidato real a um helper compartilhado
 * (`core/http/testing/realApiServer.ts`), identificado desde `IMP_304_PURCHASE_FRONTEND_REPORT.md` e
 * reafirmado a cada Sprint subsequente — ainda não extraído nesta Sprint também, per instrução
 * explícita ("Não refatorar neste Sprint"), seguindo à risca o padrão já consolidado pela quarta vez
 * consecutiva.
 *
 * `@abp/persistence` (via `db/migrate.ts`) resolve a pasta de migrations com
 * `fileURLToPath(new URL(".", import.meta.url))`, usando o `URL` global — que, sob
 * `@vitest-environment jsdom` (exigido pelos testes de Hook desta Sprint, `renderHook` depende de
 * DOM), é o polyfill de `URL` do próprio jsdom, não a classe nativa do Node; `fileURLToPath` rejeita
 * essa instância ("The URL must be of scheme file"), mesmo conflito de ambiente já documentado em
 * IMP-204/IMP-304/IMP-404. Corrigido apenas neste helper de teste: `globalThis.URL` é temporariamente
 * restaurado à classe nativa do Node antes de importar (dinamicamente) `@abp/persistence` e o
 * `server.ts` de `apps/api` — nunca alterando nenhum dos dois pacotes.
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
 * `close()` que encerra tanto o servidor quanto a conexão de banco. Usado exclusivamente por teste de
 * integração real do Production Hub — nunca por nenhum componente de produção.
 */
export async function startRealApiServer(beforeListen?: (fastify: FastifyInstance) => void): Promise<RealApiServer> {
  const fastify = await importWithNodeUrl(async () => {
    const { createDatabase, runMigrations } = await import("@abp/persistence");
    // Import relativo direto ao código-fonte de `apps/api`, nunca ao pacote por nome (`@abp/api`) —
    // mesma decisão documentada em IMP-204/IMP-304/IMP-404: `@abp/api/package.json` não declara
    // `exports`, e adicionar um agora contaria como alteração a `apps/api`, proibida nesta Sprint.
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
