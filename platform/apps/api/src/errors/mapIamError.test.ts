import { describe, expect, it } from "vitest";
import { UnauthorizedError } from "./HttpError.js";
import { mapIamError } from "./mapIamError.js";

describe("mapIamError — tradução de erro específica das rotas /auth/*", () => {
  it("falha de autenticação ('...não corresponde.') vira 401, nunca 500 (mapDomainError não reconhece este padrão)", () => {
    const mapped = mapIamError(new Error('Falha de autenticação para a Identity "identity-1" — Credential de tipo "Password" não corresponde.'));
    expect(mapped).toBeInstanceOf(UnauthorizedError);
    expect(mapped.statusCode).toBe(401);
  });

  it("nunca ecoa a Identity nem qualquer detalhe da mensagem original — mensagem sempre genérica e fixa", () => {
    const mapped = mapIamError(new Error('Falha de autenticação para a Identity "identity-secreta@example.com" — Credential de tipo "Password" não corresponde.'));
    expect(mapped.message).not.toContain("identity-secreta@example.com");
    expect(mapped.message).toBe("Identity ou Credential inválidos.");
  });

  it("Session não encontrada vira 401, nunca 404 (mapDomainError mapearia para 404 — semanticamente errado para uma credencial de sessão)", () => {
    const mapped = mapIamError(new Error("Session session-1 não encontrada."));
    expect(mapped).toBeInstanceOf(UnauthorizedError);
    expect(mapped.statusCode).toBe(401);
  });

  it("Session expirada/revogada vira 401, nunca 500 (mapDomainError não reconhece 'não está ativa')", () => {
    const mapped = mapIamError(new Error("Session session-1 não está ativa — expirada ou revogada."));
    expect(mapped).toBeInstanceOf(UnauthorizedError);
    expect(mapped.statusCode).toBe(401);
  });

  it("um HttpError já construído passa direto, sem re-mapeamento", () => {
    const original = new UnauthorizedError("já classificado");
    expect(mapIamError(original)).toBe(original);
  });

  it("uma mensagem não relacionada a IAM delega para mapDomainError (nunca reclassifica arbitrariamente)", () => {
    const mapped = mapIamError(new Error("Tenant tenant-1 já possui um Business Profile ativo."));
    expect(mapped.statusCode).toBe(409);
  });

  it("mensagem genuinamente desconhecida ainda vira 500 (mapDomainError como fallback final)", () => {
    const mapped = mapIamError(new Error("algo genuinamente inesperado"));
    expect(mapped.statusCode).toBe(500);
  });
});
