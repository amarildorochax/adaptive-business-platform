/**
 * DTOs do contrato HTTP do Purchase Hub — espelham exatamente `apps/api/src/dtos/purchase.dto.ts`
 * (IMP-303). Cópia deliberada, nunca um import cruzado entre `apps/web` e `apps/api` (mesma
 * disciplina de `supplier.dto.ts`, IMP-204) — cada camada permanece independente, per instrução
 * explícita de IMP-304 ("Nunca compartilhar DTOs entre Backend e Frontend").
 */

export interface MoneyDto {
  readonly amount: number;
  readonly currencyCode: string;
}

export interface ReceivingLineDto {
  readonly purchaseOrderItemId: string;
  readonly quantityReceived: number;
}

export interface PurchaseRequisitionLineDto {
  readonly productId: string;
  readonly suggestedQuantity: number;
}

// ---- Purchase Order ----

export interface CreatePurchaseOrderRequestDto {
  readonly tenantId: string;
  readonly supplierId: string;
}

export interface AddPurchaseOrderItemRequestDto {
  readonly productId: string;
  readonly quantityOrdered: number;
  readonly acquisitionCost: MoneyDto;
}

export interface ApprovePurchaseOrderRequestDto {
  readonly threshold: MoneyDto;
  readonly approvedByIdentityId?: string;
}

export interface PurchaseOrderItemResponseDto {
  readonly purchaseOrderItemId: string;
  readonly purchaseOrderId: string;
  readonly productId: string;
  readonly quantityOrdered: number;
  readonly quantityReceived: number;
  readonly acquisitionCost: MoneyDto;
  readonly status: string;
}

export interface PurchaseOrderResponseDto {
  readonly purchaseOrderId: string;
  readonly tenantId: string;
  readonly supplierId: string;
  readonly requisitionId?: string;
  readonly status: string;
  readonly items: readonly PurchaseOrderItemResponseDto[];
  readonly approvedByIdentityId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ---- Receiving ----

export interface RegisterReceivingRequestDto {
  readonly purchaseOrderId: string;
  readonly tenantId: string;
  readonly lines: readonly ReceivingLineDto[];
  readonly receivedAt: string;
}

export interface ReceivingResponseDto {
  readonly receivingId: string;
  readonly purchaseOrderId: string;
  readonly tenantId: string;
  readonly lines: readonly ReceivingLineDto[];
  readonly receivedAt: string;
}

/** Resultado composto — reflete `RegisterReceivingResult` (Core) via `RegisterReceivingResponseDto` (HTTP, IMP-303). */
export interface RegisterReceivingResponseDto {
  readonly receiving: ReceivingResponseDto;
  readonly purchaseOrder: PurchaseOrderResponseDto;
  readonly fullyReceived: boolean;
}

// ---- Purchase Requisition ----

export interface CreatePurchaseRequisitionRequestDto {
  readonly tenantId: string;
  readonly origin: "Manual" | "AIRecommendation" | "ReorderRule";
  readonly lines: readonly PurchaseRequisitionLineDto[];
}

export interface AcquisitionCostEntryDto {
  readonly productId: string;
  readonly cost: MoneyDto;
}

export interface ConvertRequisitionToPurchaseOrderRequestDto {
  readonly supplierId: string;
  readonly acquisitionCosts: readonly AcquisitionCostEntryDto[];
}

export interface PurchaseRequisitionResponseDto {
  readonly requisitionId: string;
  readonly tenantId: string;
  readonly origin: string;
  readonly lines: readonly PurchaseRequisitionLineDto[];
  readonly status: string;
  readonly purchaseOrderId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Resultado composto de `convertRequisitionToPurchaseOrder` — a Requisition atualizada e o novo Purchase Order, ambos no mesmo corpo de resposta. */
export interface ConvertRequisitionToPurchaseOrderResponseDto {
  readonly requisition: PurchaseRequisitionResponseDto;
  readonly purchaseOrder: PurchaseOrderResponseDto;
}

// ---- Reorder Rule ----

export interface CreateReorderRuleRequestDto {
  readonly tenantId: string;
  readonly productId: string;
  readonly thresholdQuantity: number;
  readonly reorderQuantity: number;
  readonly preferredSupplierId?: string;
}

export interface ReorderRuleResponseDto {
  readonly ruleId: string;
  readonly tenantId: string;
  readonly productId: string;
  readonly thresholdQuantity: number;
  readonly reorderQuantity: number;
  readonly preferredSupplierId?: string;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface EvaluateReorderRuleRequestDto {
  readonly currentQuantity: number;
}

/** Resultado de `evaluateReorderRule` — `requisition` só está presente quando a Regra realmente dispara (`triggered: true`). */
export interface EvaluateReorderRuleResponseDto {
  readonly rule: ReorderRuleResponseDto;
  readonly triggered: boolean;
  readonly requisition?: PurchaseRequisitionResponseDto;
}
