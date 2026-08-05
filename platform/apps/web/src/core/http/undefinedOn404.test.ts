import { describe, expect, it } from "vitest";
import { ApiError } from "./ApiError";
import { undefinedOn404 } from "./undefinedOn404";

describe("undefinedOn404 — 404 é 'nenhum dado ainda', nunca um erro de UI", () => {
  it("devolve o valor resolvido quando a função não lança", async () => {
    const result = await undefinedOn404(() => Promise.resolve({ ok: true }));
    expect(result).toEqual({ ok: true });
  });

  it("converte ApiError 404 em undefined", async () => {
    const result = await undefinedOn404<{ ok: true }>(() => Promise.reject(new ApiError(404, "NOT_FOUND", "não encontrado")));
    expect(result).toBeUndefined();
  });

  it("repropaga ApiError com statusCode diferente de 404", async () => {
    await expect(undefinedOn404(() => Promise.reject(new ApiError(500, "INTERNAL", "erro interno")))).rejects.toMatchObject({ statusCode: 500 });
  });

  it("repropaga erros que não são ApiError (ex.: ApiNetworkError)", async () => {
    const networkError = new Error("network down");
    await expect(undefinedOn404(() => Promise.reject(networkError))).rejects.toBe(networkError);
  });
});
