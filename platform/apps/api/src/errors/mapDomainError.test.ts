import { describe, expect, it } from "vitest";
import { ConflictError, HttpError, InternalServerError, NotFoundError, UnprocessableEntityError } from "./HttpError.js";
import { mapDomainError } from "./mapDomainError.js";

describe("mapDomainError — heurística de tradução de Error de domínio para HttpError", () => {
  it("mensagem 'não encontrado' vira NotFoundError (404)", () => {
    const mapped = mapDomainError(new Error("Customer customer-1 não encontrado."));
    expect(mapped).toBeInstanceOf(NotFoundError);
    expect(mapped.statusCode).toBe(404);
  });

  it("mensagem 'já existe/possui' vira ConflictError (409)", () => {
    const mapped = mapDomainError(new Error("Tenant tenant-1 já possui um Business Profile ativo."));
    expect(mapped).toBeInstanceOf(ConflictError);
    expect(mapped.statusCode).toBe(409);
  });

  it("mensagem de precondição/validação vira UnprocessableEntityError (422)", () => {
    const mapped = mapDomainError(new Error("Opportunity só pode ser associada a um Relationship de partyType Customer ou Organization."));
    expect(mapped).toBeInstanceOf(UnprocessableEntityError);
    expect(mapped.statusCode).toBe(422);
  });

  it("precondição de pré-existência do Branding ('Nenhum Theme existente'/'Nenhuma paleta anterior existente') vira 422, nunca 404", () => {
    expect(mapDomainError(new Error("Nenhum Theme existente — use generateInitialBrandIdentity.")).statusCode).toBe(422);
    expect(mapDomainError(new Error("Nenhuma paleta anterior existente para este Theme — use generateInitialBrandIdentity.")).statusCode).toBe(422);
  });

  it("mensagem não reconhecida vira InternalServerError (500), nunca 400/404/409/422 por suposição", () => {
    const mapped = mapDomainError(new Error("algo genuinamente inesperado aconteceu"));
    expect(mapped).toBeInstanceOf(InternalServerError);
    expect(mapped.statusCode).toBe(500);
  });

  it("um valor não-Error (ex.: string lançada) vira InternalServerError, nunca lança de volta", () => {
    const mapped = mapDomainError("erro cru");
    expect(mapped).toBeInstanceOf(InternalServerError);
  });

  it("um HttpError já construído passa direto, sem re-mapeamento", () => {
    const original = new ConflictError("conflito já classificado");
    expect(mapDomainError(original)).toBe(original);
  });

  it("nunca vaza a mensagem original de um erro verdadeiramente interno — HttpError sempre com mensagem genérica", () => {
    const mapped = mapDomainError(new Error("detalhe interno sensível, nunca deveria chegar ao cliente"));
    expect(mapped).toBeInstanceOf(HttpError);
    expect(mapped.message).toBe("Erro interno do servidor.");
  });
});
