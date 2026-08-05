import { createDatabase } from "@abp/persistence";
import type { FastifyInstance } from "fastify";
import { buildServer } from "../server.js";

/**
 * Helper exclusivo de teste — nunca referenciado por `main.ts`. Constrói o mesmo `buildServer` real,
 * injetando um banco `:memory:` isolado por teste (nunca o arquivo de desenvolvimento/produção) e
 * desligando o logger (saída de teste limpa). `fastify.inject()` (usado por todo teste de rota desta
 * Sprint) simula uma requisição HTTP real, ponta a ponta, sem abrir uma porta de rede de verdade.
 */
export async function buildTestServer(): Promise<FastifyInstance> {
  const handle = createDatabase({ environment: "testing", databasePath: ":memory:" });
  return buildServer({ dbHandle: handle, logger: false });
}
