/**
 * DTOs da camada HTTP para Purchase Hub — nunca `PurchaseOrder`/`PurchaseOrderItem`/`Receiving`/
 * `PurchaseRequisition`/`ReorderRule` de `@abp/purchase-hub` usados diretamente, mesma disciplina já
 * aplicada a `supplier.dto.ts` (IMP-203).
 *
 * `Money` permanece um objeto aninhado (`MoneyDto`), mesma exceção deliberada de `supplier.dto.ts` —
 * dois campos que sempre viajam juntos. `ApprovalThreshold` (`{ limit: Money }`), por ter um único
 * campo cujo valor é ele mesmo um objeto, é achatado de forma diferente de `TaxId`/`PaymentTerms`
 * (Supplier Hub): o *wrapper* (`limit`) desaparece, não o `Money` interno — `ApprovePurchaseOrderRequestDto.threshold`
 * é diretamente um `MoneyDto`, nunca `{ limit: MoneyDto }`. Decisão documentada em
 * `IMP_303_PURCHASE_HTTP_API_REPORT.md`.
 *
 * `ReceivingLine`/`PurchaseRequisitionLine` (Value Objects sem identificador no Core) viajam como
 * array de objeto simples — mesma forma na Request e na Response, nenhuma duplicação de tipo.
 * `ConvertRequisitionToPurchaseOrderRequestDto.acquisitionCosts` é um array de `{ productId, cost }`,
 * nunca um objeto-mapa — `PurchaseManager.convertRequisitionToPurchaseOrder` espera um
 * `ReadonlyMap<string, Money>`; o handler (`routes/purchase.ts`) converte o array recebido em `Map`,
 * porque JSON não possui um tipo `Map` nativo.
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

/** Resultado composto — reflete `RegisterReceivingResult` (Core), o primeiro método do Purchase Hub cujo resultado não é uma única Entidade nem um array delas. */
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
