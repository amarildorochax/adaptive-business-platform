import {
  DuplicateSupplierTaxIdError,
  InvalidMoneyError,
  InvalidTaxIdError,
  SupplierCatalogItemNotFoundError,
  SupplierInvalidStatusTransitionError,
  SupplierNotFoundError,
} from "@abp/supplier-hub";
import { describe, expect, it } from "vitest";
import { ConflictError, NotFoundError, UnauthorizedError, UnprocessableEntityError } from "./HttpError.js";
import { mapSupplierError } from "./mapSupplierError.js";

describe("mapSupplierError — tradução de erro específica das rotas /suppliers*/supplier-*", () => {
  it("SupplierNotFoundError vira 404", () => {
    const mapped = mapSupplierError(new SupplierNotFoundError("supplier-1"));
    expect(mapped).toBeInstanceOf(NotFoundError);
    expect(mapped.statusCode).toBe(404);
  });

  it("SupplierCatalogItemNotFoundError vira 404", () => {
    const mapped = mapSupplierError(new SupplierCatalogItemNotFoundError("item-1"));
    expect(mapped.statusCode).toBe(404);
  });

  it("DuplicateSupplierTaxIdError vira 409", () => {
    const mapped = mapSupplierError(new DuplicateSupplierTaxIdError("12345678000199"));
    expect(mapped).toBeInstanceOf(ConflictError);
    expect(mapped.statusCode).toBe(409);
  });

  it("SupplierInvalidStatusTransitionError vira 409", () => {
    const mapped = mapSupplierError(new SupplierInvalidStatusTransitionError("Active", "Active"));
    expect(mapped.statusCode).toBe(409);
  });

  it("InvalidTaxIdError vira 422 — divergência corrigida: mapDomainError não reconheceria esta mensagem e cairia em 500", () => {
    const mapped = mapSupplierError(new InvalidTaxIdError("123"));
    expect(mapped).toBeInstanceOf(UnprocessableEntityError);
    expect(mapped.statusCode).toBe(422);
  });

  it("InvalidMoneyError vira 422 — mesma divergência corrigida", () => {
    const mapped = mapSupplierError(new InvalidMoneyError());
    expect(mapped.statusCode).toBe(422);
  });

  it("um HttpError já construído passa direto, sem re-mapeamento", () => {
    const original = new UnauthorizedError("já classificado");
    expect(mapSupplierError(original)).toBe(original);
  });

  it("um erro não relacionado ao Supplier Hub delega para mapDomainError (nunca reclassifica arbitrariamente)", () => {
    const mapped = mapSupplierError(new Error("Tenant tenant-1 já possui um Business Profile ativo."));
    expect(mapped.statusCode).toBe(409);
  });

  it("mensagem genuinamente desconhecida ainda vira 500 (mapDomainError como fallback final)", () => {
    const mapped = mapSupplierError(new Error("algo genuinamente inesperado"));
    expect(mapped.statusCode).toBe(500);
  });
});
