import { describe, expect, it } from "vitest";
import { buildTestServer } from "../testing/buildTestServer.js";

describe("errorHandler — erros de transporte do próprio Fastify", () => {
  it("JSON malformado no corpo é respondido com o statusCode 4xx que o próprio Fastify já atribui, nunca reclassificado como 500", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({
      method: "POST",
      url: "/business-profiles",
      payload: "{ isto não é json válido",
      headers: { "content-type": "application/json" },
    });

    expect(response.statusCode).toBeLessThan(500);
    expect(response.statusCode).toBeGreaterThanOrEqual(400);
    const body = response.json() as { error: { code: string; correlationId: string } };
    expect(body.error.code.startsWith("FST_")).toBe(true);
    expect(body.error.correlationId).toBeTruthy();

    await fastify.close();
  });

  it("rota inexistente devolve 404 padronizado (setNotFoundHandler), com correlationId presente", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "GET", url: "/rota-que-nunca-existiu" });

    expect(response.statusCode).toBe(404);
    const body = response.json() as { error: { code: string; correlationId: string } };
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.correlationId).toBeTruthy();

    await fastify.close();
  });
});
