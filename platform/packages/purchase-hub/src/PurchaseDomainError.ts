/**
 * PurchaseDomainError — a taxonomia de erro de domínio do Purchase Hub, distinta de `PlatformError`
 * (`@abp/shared`) e nunca reutilizando `SupplierDomainError` (`@abp/supplier-hub`), per instrução
 * explícita de IMP-301 ("Criar Domain Errors específicos do Purchase Hub. Nunca reutilizar erros de
 * outro Hub"). Cada classe aqui representa a violação de uma regra específica já registrada em
 * `PURCHASE_HUB.md`, Capítulo 12 ("Regras de Negócio"), nunca uma condição técnica genérica.
 */

export abstract class PurchaseDomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Nenhum Purchase Order foi encontrado para o identificador informado. */
export class PurchaseOrderNotFoundError extends PurchaseDomainError {
  readonly code = 'PURCHASE_ORDER_NOT_FOUND';

  constructor(purchaseOrderId: string) {
    super(`Purchase Order ${purchaseOrderId} não encontrado.`);
  }
}

/** Nenhum PurchaseOrderItem foi encontrado para o identificador informado. */
export class PurchaseOrderItemNotFoundError extends PurchaseDomainError {
  readonly code = 'PURCHASE_ORDER_ITEM_NOT_FOUND';

  constructor(purchaseOrderItemId: string) {
    super(`PurchaseOrderItem ${purchaseOrderItemId} não encontrado.`);
  }
}

/**
 * `AddPurchaseOrderItem` foi chamado sobre um Purchase Order que já saiu da fase de montagem
 * (`PurchasePolicy.canAddPurchaseOrderItem`) — nunca após aprovação, envio ou qualquer recebimento.
 */
export class PurchaseOrderItemAdditionNotAllowedError extends PurchaseDomainError {
  readonly code = 'PURCHASE_ORDER_ITEM_ADDITION_NOT_ALLOWED';

  constructor(purchaseOrderId: string, status: string) {
    super(`Purchase Order ${purchaseOrderId} está em status ${status} e não aceita novos itens.`);
  }
}

/**
 * A transição de status solicitada não é permitida pela máquina de estados de `PurchaseStatus`
 * (`PurchasePolicy.canTransitionPurchaseOrderStatus`).
 */
export class PurchaseOrderInvalidStatusTransitionError extends PurchaseDomainError {
  readonly code = 'PURCHASE_ORDER_INVALID_STATUS_TRANSITION';

  constructor(from: string, to: string) {
    super(`Transição de status de Purchase Order inválida: ${from} → ${to}.`);
  }
}

/**
 * O total do Purchase Order excede o `ApprovalThreshold` informado e nenhuma identidade de
 * aprovação explícita (`approvedByIdentityId`) foi fornecida — regra "Purchase Order acima do
 * ApprovalThreshold exige PurchaseApproved explícito" (`PURCHASE_HUB.md`, Capítulo 12, ADR-PU-004).
 */
export class PurchaseOrderApprovalRequiresIdentityError extends PurchaseDomainError {
  readonly code = 'PURCHASE_ORDER_APPROVAL_REQUIRES_IDENTITY';

  constructor(purchaseOrderId: string) {
    super(`Purchase Order ${purchaseOrderId} excede o teto de aprovação automática e requer uma identidade de aprovação explícita.`);
  }
}

/**
 * Um Purchase Order que já possui ao menos um `Receiving` associado nunca pode ser cancelado —
 * regra "Nenhum Purchase Order pode ser cancelado após já possuir Receiving" (`PURCHASE_HUB.md`,
 * Capítulo 12).
 */
export class PurchaseOrderHasReceivingCannotCancelError extends PurchaseDomainError {
  readonly code = 'PURCHASE_ORDER_HAS_RECEIVING_CANNOT_CANCEL';

  constructor(purchaseOrderId: string) {
    super(`Purchase Order ${purchaseOrderId} já possui Receiving registrado e não pode mais ser cancelado.`);
  }
}

/**
 * A quantidade recebida em uma `ReceivingLine` excede a quantidade ainda pendente do
 * `PurchaseOrderItem` correspondente — regra "Quantidade recebida nunca excede a quantidade pendente
 * do item" (`PURCHASE_HUB.md`, Capítulo 12).
 */
export class ReceivingQuantityExceedsPendingError extends PurchaseDomainError {
  readonly code = 'RECEIVING_QUANTITY_EXCEEDS_PENDING';

  constructor(purchaseOrderItemId: string) {
    super(`Quantidade recebida para o item ${purchaseOrderItemId} excede a quantidade ainda pendente.`);
  }
}

/** O Money informado é inválido (valor negativo, não finito, ou moeda ausente). */
export class InvalidMoneyError extends PurchaseDomainError {
  readonly code = 'PURCHASE_INVALID_MONEY';

  constructor() {
    super('Valor monetário inválido — deve ser não negativo e possuir uma moeda válida.');
  }
}

/** A `ReceivingLine` informada é inválida (quantidade não positiva). */
export class InvalidReceivingLineError extends PurchaseDomainError {
  readonly code = 'PURCHASE_INVALID_RECEIVING_LINE';

  constructor() {
    super('Linha de recebimento inválida — a quantidade recebida deve ser positiva.');
  }
}

/** Nenhuma Purchase Requisition foi encontrada para o identificador informado. */
export class PurchaseRequisitionNotFoundError extends PurchaseDomainError {
  readonly code = 'PURCHASE_REQUISITION_NOT_FOUND';

  constructor(requisitionId: string) {
    super(`Purchase Requisition ${requisitionId} não encontrada.`);
  }
}

/**
 * A transição de status solicitada não é permitida pela máquina de estados de
 * `PurchaseRequisitionStatus` (`PurchasePolicy.canTransitionRequisitionStatus`).
 */
export class PurchaseRequisitionInvalidStatusTransitionError extends PurchaseDomainError {
  readonly code = 'PURCHASE_REQUISITION_INVALID_STATUS_TRANSITION';

  constructor(from: string, to: string) {
    super(`Transição de status de Purchase Requisition inválida: ${from} → ${to}.`);
  }
}

/**
 * `ConvertRequisitionToPurchaseOrder` foi chamado sobre uma Requisition cujo status não é
 * `Approved` — regra "Apenas Requisition aprovada pode ser convertida em Purchase Order"
 * (`PURCHASE_HUB.md`, Capítulo 9/12).
 */
export class PurchaseRequisitionNotApprovedError extends PurchaseDomainError {
  readonly code = 'PURCHASE_REQUISITION_NOT_APPROVED';

  constructor(requisitionId: string) {
    super(`Purchase Requisition ${requisitionId} não está aprovada e não pode ser convertida em Purchase Order.`);
  }
}

/**
 * `ConvertRequisitionToPurchaseOrder` foi chamado sem informar o custo de aquisição negociado para
 * algum Produto sugerido pela Requisition — o custo só é conhecido ao negociar com um Fornecedor
 * específico, nunca presente na própria Requisition (ver `PurchaseRequisitionLine`).
 */
export class MissingAcquisitionCostError extends PurchaseDomainError {
  readonly code = 'PURCHASE_MISSING_ACQUISITION_COST';

  constructor(productId: string) {
    super(`Nenhum custo de aquisição foi informado para o produto ${productId} ao converter a Requisition em Purchase Order.`);
  }
}

/** Nenhuma Reorder Rule foi encontrada para o identificador informado. */
export class ReorderRuleNotFoundError extends PurchaseDomainError {
  readonly code = 'REORDER_RULE_NOT_FOUND';

  constructor(ruleId: string) {
    super(`Reorder Rule ${ruleId} não encontrada.`);
  }
}
