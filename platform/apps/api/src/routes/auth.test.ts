import { describe, expect, it } from "vitest";
import { buildTestServer } from "../testing/buildTestServer.js";

describe("Rotas HTTP de autenticação (/auth/*)", () => {
  it("fluxo completo: register -> login -> me -> authorize (negado, sem Role) -> refresh -> logout -> me após logout (401)", async () => {
    const fastify = await buildTestServer();

    const registered = await fastify.inject({ method: "POST", url: "/auth/register", payload: { identity: "ana@example.com", password: "senha-super-secreta" } });
    expect(registered.statusCode).toBe(201);
    expect((registered.json() as { identity: string }).identity).toBe("ana@example.com");

    const login = await fastify.inject({ method: "POST", url: "/auth/login", payload: { identity: "ana@example.com", password: "senha-super-secreta", tenantId: "tenant-1" } });
    expect(login.statusCode).toBe(200);
    const { accessToken, expiresAt } = login.json() as { accessToken: string; expiresAt: string };
    expect(accessToken).toBeTruthy();
    expect(expiresAt).toBeTruthy();

    const me = await fastify.inject({ method: "GET", url: "/auth/me", headers: { authorization: `Bearer ${accessToken}` } });
    expect(me.statusCode).toBe(200);
    expect(me.json()).toEqual({ identity: "ana@example.com", tenantId: "tenant-1", sessionId: accessToken, roles: [] });

    const denied = await fastify.inject({ method: "POST", url: "/auth/authorize", headers: { authorization: `Bearer ${accessToken}` }, payload: { action: "finance:approve" } });
    expect(denied.statusCode).toBe(200);
    expect(denied.json()).toEqual({ action: "finance:approve", permitted: false });

    const refreshed = await fastify.inject({ method: "POST", url: "/auth/refresh", headers: { authorization: `Bearer ${accessToken}` } });
    expect(refreshed.statusCode).toBe(200);
    const refreshedBody = refreshed.json() as { accessToken: string; expiresAt: string };
    expect(refreshedBody.accessToken).toBe(accessToken);

    const loggedOut = await fastify.inject({ method: "POST", url: "/auth/logout", headers: { authorization: `Bearer ${accessToken}` } });
    expect(loggedOut.statusCode).toBe(204);

    const meAfterLogout = await fastify.inject({ method: "GET", url: "/auth/me", headers: { authorization: `Bearer ${accessToken}` } });
    expect(meAfterLogout.statusCode).toBe(401);

    await fastify.close();
  });

  it("authorize devolve permitted: true depois que o IAMManager já concedeu a Permissão ao Papel do Perfil (fluxo real de autorização)", async () => {
    const fastify = await buildTestServer();

    await fastify.inject({ method: "POST", url: "/auth/register", payload: { identity: "financeiro@example.com", password: "senha-financeiro" } });
    const login = await fastify.inject({ method: "POST", url: "/auth/login", payload: { identity: "financeiro@example.com", password: "senha-financeiro", tenantId: "tenant-1" } });
    const { accessToken } = login.json() as { accessToken: string };

    await fastify.managers.iam.assignRole("financeiro@example.com", "tenant-1", "Financeiro");
    await fastify.managers.iam.grantPermission("Financeiro", "finance:approve");

    const authorized = await fastify.inject({ method: "POST", url: "/auth/authorize", headers: { authorization: `Bearer ${accessToken}` }, payload: { action: "finance:approve" } });
    expect(authorized.statusCode).toBe(200);
    expect(authorized.json()).toEqual({ action: "finance:approve", permitted: true });

    const me = await fastify.inject({ method: "GET", url: "/auth/me", headers: { authorization: `Bearer ${accessToken}` } });
    expect((me.json() as { roles: string[] }).roles).toEqual(["Financeiro"]);

    await fastify.close();
  });

  it("401 — login com senha incorreta, mensagem genérica, nunca ecoa a Identity", async () => {
    const fastify = await buildTestServer();

    await fastify.inject({ method: "POST", url: "/auth/register", payload: { identity: "ana@example.com", password: "senha-correta" } });
    const response = await fastify.inject({ method: "POST", url: "/auth/login", payload: { identity: "ana@example.com", password: "senha-errada", tenantId: "tenant-1" } });

    expect(response.statusCode).toBe(401);
    const body = response.json() as { error: { code: string; message: string } };
    expect(body.error.message).not.toContain("ana@example.com");
    expect(body.error.code).toBe("UNAUTHORIZED");

    await fastify.close();
  });

  it("401 — login para uma Identity nunca registrada devolve exatamente a mesma resposta que senha incorreta (nenhum sinal de enumeração)", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "POST", url: "/auth/login", payload: { identity: "nunca-existiu@example.com", password: "qualquer-senha", tenantId: "tenant-1" } });

    expect(response.statusCode).toBe(401);
    expect((response.json() as { error: { message: string } }).error.message).toBe("Identity ou Credential inválidos.");

    await fastify.close();
  });

  it("401 — qualquer rota protegida sem cabeçalho Authorization", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "GET", url: "/auth/me" });
    expect(response.statusCode).toBe(401);

    await fastify.close();
  });

  it("401 — cabeçalho Authorization com um sessionId nunca emitido", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "GET", url: "/auth/me", headers: { authorization: "Bearer sessao-nunca-existiu" } });
    expect(response.statusCode).toBe(401);

    await fastify.close();
  });

  it("400 — registro com senha menor que 8 caracteres é rejeitado pela validação de schema", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "POST", url: "/auth/register", payload: { identity: "ana@example.com", password: "curta" } });
    expect(response.statusCode).toBe(400);

    await fastify.close();
  });

  it("re-registrar a mesma Identity efetivamente troca a senha (Credential mais recente vence, disciplina já existente de CredentialService.matches)", async () => {
    const fastify = await buildTestServer();

    await fastify.inject({ method: "POST", url: "/auth/register", payload: { identity: "ana@example.com", password: "senha-antiga-123" } });
    await fastify.inject({ method: "POST", url: "/auth/register", payload: { identity: "ana@example.com", password: "senha-nova-456" } });

    const oldLogin = await fastify.inject({ method: "POST", url: "/auth/login", payload: { identity: "ana@example.com", password: "senha-antiga-123", tenantId: "tenant-1" } });
    expect(oldLogin.statusCode).toBe(401);

    const newLogin = await fastify.inject({ method: "POST", url: "/auth/login", payload: { identity: "ana@example.com", password: "senha-nova-456", tenantId: "tenant-1" } });
    expect(newLogin.statusCode).toBe(200);

    await fastify.close();
  });
});
