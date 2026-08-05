import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "./ApiClient";
import { ApiError, ApiNetworkError } from "./ApiError";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("ApiClient — camada única de comunicação HTTP", () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient({ baseUrl: "http://127.0.0.1:3001", timeoutMs: 10_000 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("GET monta a URL a partir do baseUrl e devolve o corpo JSON desserializado", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse({ hello: "world" })));
    vi.stubGlobal("fetch", fetchMock);

    const result = await client.get<{ hello: string }>("/business-profiles/by-tenant/t1");

    expect(result).toEqual({ hello: "world" });
    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:3001/business-profiles/by-tenant/t1", expect.objectContaining({ method: "GET" }));
  });

  it("POST serializa o corpo como JSON e envia Content-Type application/json", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse({ ok: true })));
    vi.stubGlobal("fetch", fetchMock);

    await client.post("/crm/leads", { name: "Ana" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:3001/crm/leads",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ name: "Ana" }), headers: expect.objectContaining({ "Content-Type": "application/json" }) }),
    );
  });

  it("POST sem corpo não envia Content-Type (regressão: apps/api rejeita application/json com corpo vazio via FST_ERR_CTP_EMPTY_JSON_BODY)", async () => {
    const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(jsonResponse({ profileId: "p1", stage: "Perfil Validado" })));
    vi.stubGlobal("fetch", fetchMock);

    await client.post("/business-profiles/p1/validate");

    const [, requestInit] = fetchMock.mock.calls[0];
    expect(requestInit?.body).toBeUndefined();
    expect(requestInit?.headers ?? {}).not.toHaveProperty("Content-Type");
  });

  it("PATCH envia o método correto", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse({ ok: true })));
    vi.stubGlobal("fetch", fetchMock);

    await client.patch("/crm/customers/c1", { name: "Novo nome" });

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:3001/crm/customers/c1", expect.objectContaining({ method: "PATCH" }));
  });

  it("setBaseUrl (IMP-204) sobrescreve o baseUrl resolvido no boot — usado exclusivamente por teste de integração real", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse({ ok: true })));
    vi.stubGlobal("fetch", fetchMock);

    client.setBaseUrl("http://127.0.0.1:59999");
    await client.get("/health");

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:59999/health", expect.objectContaining({ method: "GET" }));
  });

  it("resposta 204 devolve undefined sem tentar desserializar", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(null, { status: 204 }))));

    const result = await client.post("/crm/opportunities/o1/move", { stageId: "s1" });

    expect(result).toBeUndefined();
  });

  it("resposta não-ok lança ApiError com statusCode/code/message/correlationId do corpo padronizado", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          jsonResponse({ error: { code: "NOT_FOUND", message: "Perfil não encontrado.", correlationId: "corr-1" } }, 404),
        ),
      ),
    );

    await expect(client.get("/business-profiles/by-tenant/inexistente")).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
      message: "Perfil não encontrado.",
      correlationId: "corr-1",
    });
  });

  it("resposta não-ok sem corpo JSON válido ainda lança ApiError, com fallback para statusText", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response("not json", { status: 500, statusText: "Internal Server Error" }))));

    const error = await client.get("/business-profiles/by-tenant/t1").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).statusCode).toBe(500);
    expect((error as ApiError).code).toBe("UNKNOWN");
  });

  it("falha de rede (fetch rejeita) lança ApiNetworkError, nunca ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))),
    );

    await expect(client.get("/health")).rejects.toBeInstanceOf(ApiNetworkError);
  });

  describe("credencial de sessão e interceptor 401 (FUN-100)", () => {
    it("sem Access Token definido, nenhum cabeçalho Authorization é enviado", async () => {
      const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(jsonResponse({ ok: true })));
      vi.stubGlobal("fetch", fetchMock);

      await client.get("/auth/me");

      const [, requestInit] = fetchMock.mock.calls[0];
      expect(requestInit?.headers ?? {}).not.toHaveProperty("Authorization");
    });

    it("com Access Token definido, toda requisição subsequente anexa Authorization: Bearer <token>", async () => {
      const fetchMock = vi.fn<typeof fetch>(() => Promise.resolve(jsonResponse({ ok: true })));
      vi.stubGlobal("fetch", fetchMock);

      client.setAccessToken("session-123");
      await client.get("/auth/me");

      const [, requestInit] = fetchMock.mock.calls[0];
      expect(requestInit?.headers).toMatchObject({ Authorization: "Bearer session-123" });
    });

    it("401 numa requisição SEM token nunca dispara o unauthorizedHandler (ex.: senha errada em /auth/login, não uma sessão expirada)", async () => {
      vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ error: { code: "UNAUTHORIZED", message: "Identity ou Credential inválidos.", correlationId: "c1" } }, 401))));
      const unauthorizedHandler = vi.fn(() => Promise.resolve("novo-token"));
      client.setUnauthorizedHandler(unauthorizedHandler);

      await expect(client.post("/auth/login", { identity: "x", password: "y", tenantId: "t" })).rejects.toBeInstanceOf(ApiError);
      expect(unauthorizedHandler).not.toHaveBeenCalled();
    });

    it("401 numa requisição COM token dispara o unauthorizedHandler; sucesso repete a requisição original exatamente uma vez, com o novo token", async () => {
      const fetchMock = vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(jsonResponse({ error: { code: "UNAUTHORIZED", message: "Sessão inválida, expirada ou revogada.", correlationId: "c1" } }, 401))
        .mockResolvedValueOnce(jsonResponse({ identity: "ana@example.com", tenantId: "t1", sessionId: "session-novo", roles: [] }));
      vi.stubGlobal("fetch", fetchMock);

      client.setAccessToken("session-velho");
      const unauthorizedHandler = vi.fn(async () => {
        client.setAccessToken("session-novo");
        return "session-novo";
      });
      client.setUnauthorizedHandler(unauthorizedHandler);

      const result = await client.get("/auth/me");

      expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect((fetchMock.mock.calls[1]?.[1]?.headers as Record<string, string>).Authorization).toBe("Bearer session-novo");
      expect(result).toEqual({ identity: "ana@example.com", tenantId: "t1", sessionId: "session-novo", roles: [] });
    });

    it("401 e o unauthorizedHandler também falha (devolve undefined) — propaga o 401 original, nunca tenta uma segunda vez", async () => {
      const fetchMock = vi.fn(() => Promise.resolve(jsonResponse({ error: { code: "UNAUTHORIZED", message: "Sessão inválida, expirada ou revogada.", correlationId: "c1" } }, 401)));
      vi.stubGlobal("fetch", fetchMock);

      client.setAccessToken("session-expirada");
      const unauthorizedHandler = vi.fn(() => Promise.resolve(undefined));
      client.setUnauthorizedHandler(unauthorizedHandler);

      await expect(client.get("/auth/me")).rejects.toBeInstanceOf(ApiError);
      expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
