import { describe, expect, it } from "vitest";
import { buildTestServer } from "../testing/buildTestServer.js";

describe("Rotas HTTP de Business Profile", () => {
  it("cria, valida, finaliza e consulta um Business Profile de ponta a ponta via HTTP real (fastify.inject)", async () => {
    const fastify = await buildTestServer();

    const created = await fastify.inject({ method: "POST", url: "/business-profiles", payload: { tenantId: "tenant-1", segment: "Floricultura", maturity: "elevada" } });
    expect(created.statusCode).toBe(201);
    const profile = created.json() as { profileId: string; tenantId: string; createdAt: string };
    expect(profile.tenantId).toBe("tenant-1");
    expect(typeof profile.createdAt).toBe("string");

    const validated = await fastify.inject({ method: "POST", url: `/business-profiles/${profile.profileId}/validate` });
    expect(validated.statusCode).toBe(200);
    expect((validated.json() as { stage: string }).stage).toBe("Validação");

    const finalized = await fastify.inject({ method: "POST", url: `/business-profiles/${profile.profileId}/finalize` });
    expect((finalized.json() as { stage: string }).stage).toBe("Perfil Inicial");

    const byTenant = await fastify.inject({ method: "GET", url: "/business-profiles/by-tenant/tenant-1" });
    expect(byTenant.statusCode).toBe(200);
    expect((byTenant.json() as { profileId: string }).profileId).toBe(profile.profileId);

    const classification = await fastify.inject({ method: "GET", url: `/business-profiles/${profile.profileId}/classification` });
    expect(classification.json()).toEqual({ segment: "Floricultura" });

    const maturity = await fastify.inject({ method: "GET", url: `/business-profiles/${profile.profileId}/maturity` });
    expect(maturity.json()).toEqual({ maturity: "elevada" });

    const stage = await fastify.inject({ method: "GET", url: `/business-profiles/${profile.profileId}/stage` });
    expect(stage.json()).toEqual({ stage: "Perfil Inicial" });

    await fastify.close();
  });

  it("400 — corpo inválido (maturity ausente) nunca chega ao Manager", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "POST", url: "/business-profiles", payload: { tenantId: "tenant-1", segment: "Floricultura" } });

    expect(response.statusCode).toBe(400);
    expect((response.json() as { error: { code: string } }).error.code).toBe("BAD_REQUEST");
    await fastify.close();
  });

  it("404 — consultar um Tenant sem Business Profile", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "GET", url: "/business-profiles/by-tenant/tenant-inexistente" });

    expect(response.statusCode).toBe(404);
    const body = response.json() as { error: { code: string; correlationId: string } };
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.correlationId).toBeTruthy();
    await fastify.close();
  });

  it("409 — um segundo Business Profile para o mesmo Tenant é rejeitado (ADR-001), nunca vaza a mensagem de domínio como 500", async () => {
    const fastify = await buildTestServer();

    await fastify.inject({ method: "POST", url: "/business-profiles", payload: { tenantId: "tenant-1", segment: "Floricultura", maturity: "elevada" } });
    const duplicate = await fastify.inject({ method: "POST", url: "/business-profiles", payload: { tenantId: "tenant-1", segment: "Pet Shop", maturity: "baixa" } });

    expect(duplicate.statusCode).toBe(409);
    expect((duplicate.json() as { error: { code: string } }).error.code).toBe("CONFLICT");
    await fastify.close();
  });
});
