import type {
  EvaluateReorderRuleResult,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseRequisition,
  Receiving,
  RegisterReceivingResult,
  ReorderRule,
} from "@abp/purchase-hub";
import type {
  ConvertRequisitionToPurchaseOrderResponseDto,
  EvaluateReorderRuleResponseDto,
  PurchaseOrderItemResponseDto,
  PurchaseOrderResponseDto,
  PurchaseRequisitionResponseDto,
  ReceivingResponseDto,
  RegisterReceivingResponseDto,
  ReorderRuleResponseDto,
} from "../dtos/purchase.dto.js";

export function toPurchaseOrderItemResponseDto(item: PurchaseOrderItem): PurchaseOrderItemResponseDto {
  return {
    purchaseOrderItemId: item.purchaseOrderItemId,
    purchaseOrderId: item.purchaseOrderId,
    productId: item.productId,
    quantityOrdered: item.quantityOrdered,
    quantityReceived: item.quantityReceived,
    acquisitionCost: { amount: item.acquisitionCost.amount, currencyCode: item.acquisitionCost.currencyCode },
    status: item.status,
  };
}

export function toPurchaseOrderResponseDto(purchaseOrder: PurchaseOrder): PurchaseOrderResponseDto {
  return {
    purchaseOrderId: purchaseOrder.purchaseOrderId,
    tenantId: purchaseOrder.tenantId,
    supplierId: purchaseOrder.supplierId,
    requisitionId: purchaseOrder.requisitionId,
    status: purchaseOrder.status,
    items: purchaseOrder.items.map(toPurchaseOrderItemResponseDto),
    approvedByIdentityId: purchaseOrder.approvedByIdentityId,
    createdAt: purchaseOrder.createdAt.toISOString(),
    updatedAt: purchaseOrder.updatedAt.toISOString(),
  };
}

export function toReceivingResponseDto(receiving: Receiving): ReceivingResponseDto {
  return {
    receivingId: receiving.receivingId,
    purchaseOrderId: receiving.purchaseOrderId,
    tenantId: receiving.tenantId,
    lines: receiving.lines.map((line) => ({ purchaseOrderItemId: line.purchaseOrderItemId, quantityReceived: line.quantityReceived })),
    receivedAt: receiving.receivedAt.toISOString(),
  };
}

export function toRegisterReceivingResponseDto(registration: RegisterReceivingResult): RegisterReceivingResponseDto {
  return {
    receiving: toReceivingResponseDto(registration.receiving),
    purchaseOrder: toPurchaseOrderResponseDto(registration.purchaseOrder),
    fullyReceived: registration.fullyReceived,
  };
}

export function toPurchaseRequisitionResponseDto(requisition: PurchaseRequisition): PurchaseRequisitionResponseDto {
  return {
    requisitionId: requisition.requisitionId,
    tenantId: requisition.tenantId,
    origin: requisition.origin,
    lines: requisition.lines.map((line) => ({ productId: line.productId, suggestedQuantity: line.suggestedQuantity })),
    status: requisition.status,
    purchaseOrderId: requisition.purchaseOrderId,
    createdAt: requisition.createdAt.toISOString(),
    updatedAt: requisition.updatedAt.toISOString(),
  };
}

export function toConvertRequisitionToPurchaseOrderResponseDto(conversion: {
  readonly requisition: PurchaseRequisition;
  readonly purchaseOrder: PurchaseOrder;
}): ConvertRequisitionToPurchaseOrderResponseDto {
  return {
    requisition: toPurchaseRequisitionResponseDto(conversion.requisition),
    purchaseOrder: toPurchaseOrderResponseDto(conversion.purchaseOrder),
  };
}

export function toReorderRuleResponseDto(rule: ReorderRule): ReorderRuleResponseDto {
  return {
    ruleId: rule.ruleId,
    tenantId: rule.tenantId,
    productId: rule.productId,
    thresholdQuantity: rule.thresholdQuantity,
    reorderQuantity: rule.reorderQuantity,
    preferredSupplierId: rule.preferredSupplierId,
    active: rule.active,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  };
}

export function toEvaluateReorderRuleResponseDto(evaluation: EvaluateReorderRuleResult): EvaluateReorderRuleResponseDto {
  return {
    rule: toReorderRuleResponseDto(evaluation.rule),
    triggered: evaluation.triggered,
    requisition: evaluation.requisition ? toPurchaseRequisitionResponseDto(evaluation.requisition) : undefined,
  };
}
