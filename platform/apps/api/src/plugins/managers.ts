import { createDatabase, createManagerRegistry, resolvePersistenceConfig, runMigrations, type DatabaseHandle, type ManagerRegistry } from "@abp/persistence";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    managers: ManagerRegistry;
    dbHandle: DatabaseHandle;
  }
}

export interface ManagersPluginOptions {
  /** Injeção usada exclusivamente por `testing/buildTestServer.ts` — um `:memory:` isolado por teste. Nunca fornecido pelo processo real (`main.ts`). */
  readonly handle?: DatabaseHandle;
}

/**
 * Único ponto desta Sprint onde a Composition Root de `@abp/persistence` (FUN-003) é invocada —
 * nenhum Controller, nenhuma rota, constrói um Manager, um Service ou um Repository por conta
 * própria. `createManagerRegistry('real', handle)` é chamado exatamente uma vez, no boot do
 * servidor — a mesma função, sem nenhuma modificação, já testada pela FUN-003.
 *
 * Migrations são aplicadas aqui, antes de qualquer rota aceitar tráfego — o servidor nunca fica no
 * ar com um schema desatualizado. `fastify.dbHandle` é exposto separadamente do `managers` para que
 * `GET /ready` (Seção "Observabilidade") possa checar a conexão diretamente, e para que
 * `fastify.close()` possa fechar a conexão de banco de forma ordenada (`onClose` abaixo).
 */
export const managersPlugin = fp<ManagersPluginOptions>(async (fastify, opts) => {
  const handle = opts.handle ?? createDatabase(resolvePersistenceConfig());
  runMigrations(handle);

  const managers = createManagerRegistry("real", handle);

  fastify.decorate("managers", managers);
  fastify.decorate("dbHandle", handle);

  fastify.addHook("onClose", async () => {
    handle.close();
  });
});
