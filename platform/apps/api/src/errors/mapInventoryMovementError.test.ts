import {
  InvalidQuantityDeltaError,
  InvalidStockLocationError,
  MovementOriginReferenceRequiredError,
  StockAlertRuleNotFoundError,
  StockReservationExceedsAvailableError,
  StockReservationInvalidStatusTransitionError,
  StockReservationNotFoundError,
} from "@abp/inventory-movement-hub";
import { describe, expect, it } from "vitest";
import { ConflictError, NotFoundError, UnauthorizedError, UnprocessableEntityError } from "./HttpError.js";
import { mapInventoryMovementError } from "./mapInventoryMovementError.js";

describe("mapInventoryMovementError — tradução de erro específica das rotas /stock-movements*/stock-positions*/stock-reservations*/stock-locations*/stock-alert-rules*", () => {
  it("StockReservationNotFoundError vira 404", () => {
    const mapped = mapInventoryMovementError(new StockReservationNotFoundError("reservation-1"));
    expect(mapped).toBeInstanceOf(NotFoundError);
    expect(mapped.statusCode).toBe(404);
  });

  it("StockAlertRuleNotFoundError vira 404", () => {
    expect(mapInventoryMovementError(new StockAlertRuleNotFoundError("rule-1")).statusCode).toBe(404);
  });

  it("StockReservationInvalidStatusTransitionError vira 409", () => {
    const mapped = mapInventoryMovementError(new StockReservationInvalidStatusTransitionError("Released", "Active"));
    expect(mapped).toBeInstanceOf(ConflictError);
    expect(mapped.statusCode).toBe(409);
  });

  it("InvalidQuantityDeltaError vira 422", () => {
    const mapped = mapInventoryMovementError(new InvalidQuantityDeltaError());
    expect(mapped).toBeInstanceOf(UnprocessableEntityError);
    expect(mapped.statusCode).toBe(422);
  });

  it("MovementOriginReferenceRequiredError vira 422", () => {
    expect(mapInventoryMovementError(new MovementOriginReferenceRequiredError("ProductionOutput")).statusCode).toBe(422);
  });

  it("StockReservationExceedsAvailableError vira 422", () => {
    expect(mapInventoryMovementError(new StockReservationExceedsAvailableError("product-1")).statusCode).toBe(422);
  });

  it("InvalidStockLocationError vira 422", () => {
    expect(mapInventoryMovementError(new InvalidStockLocationError()).statusCode).toBe(422);
  });

  it("um HttpError já construído passa direto, sem re-mapeamento", () => {
    const original = new UnauthorizedError("já classificado");
    expect(mapInventoryMovementError(original)).toBe(original);
  });

  it("um erro não relacionado ao Inventory Movement Hub delega para mapDomainError (nunca reclassifica arbitrariamente)", () => {
    const mapped = mapInventoryMovementError(new Error("Tenant tenant-1 já possui um Business Profile ativo."));
    expect(mapped.statusCode).toBe(409);
  });

  it("mensagem genuinamente desconhecida ainda vira 500 (mapDomainError como fallback final)", () => {
    const mapped = mapInventoryMovementError(new Error("algo genuinamente inesperado"));
    expect(mapped.statusCode).toBe(500);
  });
});
