import { describe, expect, it } from "vitest";
import { buildTestServer } from "../testing/buildTestServer.js";

const IDENTITY_PAYLOAD = { tenantId: "tenant-1", primaryColorHex: "#2E7D32", backgroundHex: "#FFFFFF", titleFont: "Poppins", bodyFont: "Inter" };

describe("Rotas HTTP de Branding", () => {
  it("gera a identidade inicial, consulta o Theme/Logo vigente, e regenera com sucesso", async () => {
    const fastify = await buildTestServer();

    const created = await fastify.inject({ method: "POST", url: "/branding/identity", payload: IDENTITY_PAYLOAD });
    expect(created.statusCode).toBe(201);
    const identity = created.json() as { theme: { themeId: string; version: number }; tokens: unknown[] };
    expect(identity.theme.version).toBe(1);
    expect(identity.tokens.length).toBeGreaterThan(0);

    const theme = await fastify.inject({ method: "GET", url: "/branding/theme/tenant-1" });
    expect((theme.json() as { version: number }).version).toBe(1);

    const logo = await fastify.inject({ method: "POST", url: "/branding/logos", payload: { tenantId: "tenant-1", assetReference: "assets/logo.svg" } });
    expect(logo.statusCode).toBe(201);

    const currentLogo = await fastify.inject({ method: "GET", url: "/branding/logos/tenant-1" });
    expect((currentLogo.json() as { assetReference: string }).assetReference).toBe("assets/logo.svg");

    const regenerated = await fastify.inject({ method: "POST", url: "/branding/theme", payload: { ...IDENTITY_PAYLOAD, primaryColorHex: "#112233" } });
    expect(regenerated.statusCode).toBe(200);
    expect((regenerated.json() as { theme: { version: number } }).theme.version).toBe(2);

    await fastify.close();
  });

  it("409 — gerar identidade inicial duas vezes para o mesmo Tenant é rejeitado (Theme já existe)", async () => {
    const fastify = await buildTestServer();

    await fastify.inject({ method: "POST", url: "/branding/identity", payload: IDENTITY_PAYLOAD });
    const second = await fastify.inject({ method: "POST", url: "/branding/identity", payload: IDENTITY_PAYLOAD });

    expect(second.statusCode).toBe(409);
    await fastify.close();
  });

  it("422 — regenerar Theme sem nenhuma identidade prévia", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "POST", url: "/branding/theme", payload: IDENTITY_PAYLOAD });

    expect(response.statusCode).toBe(422);
    expect((response.json() as { error: { code: string } }).error.code).toBe("UNPROCESSABLE_ENTITY");
    await fastify.close();
  });

  it("400 — primaryColorHex fora do formato #RRGGBB é rejeitado pela validação de schema, nunca chega ao Manager", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "POST", url: "/branding/identity", payload: { ...IDENTITY_PAYLOAD, primaryColorHex: "verde" } });

    expect(response.statusCode).toBe(400);
    await fastify.close();
  });

  it("GET /branding/context/:profileId nunca falha mesmo sem Business Profile associado — devolve campos undefined", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "GET", url: "/branding/context/profile-inexistente" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({});
    await fastify.close();
  });
});
