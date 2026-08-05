import { describe, expect, it } from "vitest";
import { ApiError, ApiNetworkError } from "./ApiError";

describe("ApiError — tradução de erros HTTP em mensagens seguras para a UI", () => {
  it("isNotFound() é verdadeiro exclusivamente para statusCode 404", () => {
    expect(new ApiError(404, "NOT_FOUND", "x").isNotFound()).toBe(true);
    expect(new ApiError(400, "BAD_REQUEST", "x").isNotFound()).toBe(false);
    expect(new ApiError(500, "INTERNAL", "x").isNotFound()).toBe(false);
  });

  it.each([
    [400, "Dado inválido. Verifique as informações enviadas."],
    [404, "Registro não encontrado."],
    [409, "Este registro já existe ou está em conflito com outro já existente."],
    [422, "Não foi possível concluir a operação — uma condição de negócio não foi satisfeita."],
    [500, "Ocorreu um erro inesperado. Tente novamente em instantes."],
    [503, "Ocorreu um erro inesperado. Tente novamente em instantes."],
  ])("toUserMessage() para statusCode %i nunca expõe a mensagem técnica original", (statusCode, expected) => {
    const error = new ApiError(statusCode, "SOME_CODE", "detalhe técnico interno que não deve aparecer na UI");
    expect(error.toUserMessage()).toBe(expected);
    expect(error.toUserMessage()).not.toContain("detalhe técnico interno");
  });

  it("preserva statusCode/code/correlationId para diagnóstico, sem exibi-los como mensagem de UI", () => {
    const error = new ApiError(409, "CONFLICT", "mensagem original", "corr-42");
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe("CONFLICT");
    expect(error.correlationId).toBe("corr-42");
    expect(error.message).toBe("mensagem original");
  });
});

describe("ApiNetworkError — distinto de ApiError, nunca carrega um statusCode HTTP real", () => {
  it("usa mensagem padrão quando nenhuma é fornecida", () => {
    const error = new ApiNetworkError();
    expect(error.name).toBe("ApiNetworkError");
    expect(error.message).toBe("Não foi possível conectar à API. Verifique sua conexão.");
  });

  it("aceita mensagem customizada", () => {
    const error = new ApiNetworkError("timeout");
    expect(error.message).toBe("timeout");
  });
});
