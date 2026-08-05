import { describe, expect, it } from "vitest";
import { buildTestServer } from "../testing/buildTestServer.js";

describe("GET /health e GET /ready", () => {
  it("/health nunca toca o banco — sempre 200", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
    await fastify.close();
  });

  it("/ready confirma o banco acessível — 200 enquanto a conexão estiver aberta", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "GET", url: "/ready" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ready" });
    await fastify.close();
  });

  it("toda resposta inclui o header x-correlation-id, ecoado de volta quando enviado pelo cliente", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "GET", url: "/health", headers: { "x-correlation-id": "correlation-fixo-de-teste" } });

    expect(response.headers["x-correlation-id"]).toBe("correlation-fixo-de-teste");
    await fastify.close();
  });
});
