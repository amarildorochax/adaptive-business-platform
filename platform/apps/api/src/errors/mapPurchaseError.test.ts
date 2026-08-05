import {
  InvalidMoneyError,
  InvalidReceivingLineError,
  MissingAcquisitionCostError,
  PurchaseOrderApprovalRequiresIdentityError,
  PurchaseOrderHasReceivingCannotCancelError,
  PurchaseOrderInvalidStatusTransitionError,
  PurchaseOrderItemAdditionNotAllowedError,
  PurchaseOrderItemNotFoundError,
  PurchaseOrderNotFoundError,
  PurchaseRequisitionInvalidStatusTransitionError,
  PurchaseRequisitionNotApprovedError,
  PurchaseRequisitionNotFoundError,
  ReceivingQuantityExceedsPendingError,
  ReorderRuleNotFoundError,
} from "@abp/purchase-hub";
import { describe, expect, it } from "vitest";
import { ConflictError, NotFoundError, UnauthorizedError, UnprocessableEntityError } from "./HttpError.js";
import { mapPurchaseError } from "./mapPurchaseError.js";

describe("mapPurchaseError — tradução de erro específica das rotas /purchase-orders*/purchase-requisitions*/receivings*/reorder-rules*", () => {
  it("PurchaseOrderNotFoundError vira 404", () => {
    const mapped = mapPurchaseError(new PurchaseOrderNotFoundError("po-1"));
    expect(mapped).toBeInstanceOf(NotFoundError);
    expect(mapped.statusCode).toBe(404);
  });

  it("PurchaseOrderItemNotFoundError vira 404", () => {
    expect(mapPurchaseError(new PurchaseOrderItemNotFoundError("item-1")).statusCode).toBe(404);
  });

  it("PurchaseRequisitionNotFoundError vira 404", () => {
    expect(mapPurchaseError(new PurchaseRequisitionNotFoundError("req-1")).statusCode).toBe(404);
  });

  it("ReorderRuleNotFoundError vira 404", () => {
    expect(mapPurchaseError(new ReorderRuleNotFoundError("rule-1")).statusCode).toBe(404);
  });

  it("PurchaseOrderItemAdditionNotAllowedError vira 409", () => {
    const mapped = mapPurchaseError(new PurchaseOrderItemAdditionNotAllowedError("po-1", "Sent"));
    expect(mapped).toBeInstanceOf(ConflictError);
    expect(mapped.statusCode).toBe(409);
  });

  it("PurchaseOrderInvalidStatusTransitionError vira 409", () => {
    expect(mapPurchaseError(new PurchaseOrderInvalidStatusTransitionError("Draft", "Approved")).statusCode).toBe(409);
  });

  it("PurchaseOrderHasReceivingCannotCancelError vira 409", () => {
    expect(mapPurchaseError(new PurchaseOrderHasReceivingCannotCancelError("po-1")).statusCode).toBe(409);
  });

  it("PurchaseRequisitionInvalidStatusTransitionError vira 409", () => {
    expect(mapPurchaseError(new PurchaseRequisitionInvalidStatusTransitionError("Open", "Approved")).statusCode).toBe(409);
  });

  it("PurchaseRequisitionNotApprovedError vira 409", () => {
    expect(mapPurchaseError(new PurchaseRequisitionNotApprovedError("req-1")).statusCode).toBe(409);
  });

  it("PurchaseOrderApprovalRequiresIdentityError vira 422", () => {
    const mapped = mapPurchaseError(new PurchaseOrderApprovalRequiresIdentityError("po-1"));
    expect(mapped).toBeInstanceOf(UnprocessableEntityError);
    expect(mapped.statusCode).toBe(422);
  });

  it("ReceivingQuantityExceedsPendingError vira 422", () => {
    expect(mapPurchaseError(new ReceivingQuantityExceedsPendingError("item-1")).statusCode).toBe(422);
  });

  it("InvalidMoneyError vira 422", () => {
    expect(mapPurchaseError(new InvalidMoneyError()).statusCode).toBe(422);
  });

  it("InvalidReceivingLineError vira 422", () => {
    expect(mapPurchaseError(new InvalidReceivingLineError()).statusCode).toBe(422);
  });

  it("MissingAcquisitionCostError vira 422", () => {
    expect(mapPurchaseError(new MissingAcquisitionCostError("product-1")).statusCode).toBe(422);
  });

  it("um HttpError já construído passa direto, sem re-mapeamento", () => {
    const original = new UnauthorizedError("já classificado");
    expect(mapPurchaseError(original)).toBe(original);
  });

  it("um erro não relacionado ao Purchase Hub delega para mapDomainError (nunca reclassifica arbitrariamente)", () => {
    const mapped = mapPurchaseError(new Error("Tenant tenant-1 já possui um Business Profile ativo."));
    expect(mapped.statusCode).toBe(409);
  });

  it("mensagem genuinamente desconhecida ainda vira 500 (mapDomainError como fallback final)", () => {
    const mapped = mapPurchaseError(new Error("algo genuinamente inesperado"));
    expect(mapped.statusCode).toBe(500);
  });
});
