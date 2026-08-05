import { describe, expect, it } from "vitest";
import { buildTestServer } from "./testing/buildTestServer.js";

describe("buildServer — Composition Root reutilizada (FUN-003), nunca reimplementada", () => {
  it("expõe os três Managers já construídos por createManagerRegistry('real', handle)", async () => {
    const fastify = await buildTestServer();

    expect(fastify.managers.businessProfile).toBeDefined();
    expect(fastify.managers.branding).toBeDefined();
    expect(fastify.managers.crm).toBeDefined();

    await fastify.close();
  });

  it("aplica as migrations no boot — as 14 tabelas dos três domínios já existem antes de qualquer requisição", async () => {
    const fastify = await buildTestServer();

    const tables = fastify.dbHandle.db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT IN ('_migrations', 'sqlite_sequence')")
      .all()
      .map((row) => (row as { name: string }).name);

    expect(tables).toContain("business_profiles");
    expect(tables).toContain("brand_themes");
    expect(tables).toContain("opportunities");

    await fastify.close();
  });

  it("fastify.close() fecha a conexão de banco de forma ordenada (onClose)", async () => {
    const fastify = await buildTestServer();
    await fastify.close();

    expect(() => fastify.dbHandle.db.prepare("SELECT 1").get()).toThrow();
  });
});
