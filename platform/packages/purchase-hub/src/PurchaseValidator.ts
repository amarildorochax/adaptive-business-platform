import { isWithinApprovalThreshold, type ApprovalThreshold } from './ApprovalThreshold';
import { isValidMoney, type Money } from './Money';
import type { PurchaseOrderItem } from './PurchaseOrderItem';
import type { PurchaseStatus } from './PurchaseOrder';
import {
  canAddPurchaseOrderItem,
  canTransitionPurchaseOrderStatus,
  canTransitionRequisitionStatus,
} from './PurchasePolicy';
import type { PurchaseRequisitionStatus } from './PurchaseRequisition';
import { isValidReceivingLine, type ReceivingLine } from './ReceivingLine';
import {
  InvalidMoneyError,
  InvalidReceivingLineError,
  MissingAcquisitionCostError,
  PurchaseOrderApprovalRequiresIdentityError,
  PurchaseOrderHasReceivingCannotCancelError,
  PurchaseOrderInvalidStatusTransitionError,
  PurchaseOrderItemAdditionNotAllowedError,
  PurchaseRequisitionInvalidStatusTransitionError,
  PurchaseRequisitionNotApprovedError,
  ReceivingQuantityExceedsPendingError,
} from './PurchaseDomainError';

/**
 * PurchaseValidator — a implementação real das validações de domínio do Purchase Hub, mesma
 * disciplina de `SupplierValidator` (`packages/supplier-hub/src/SupplierValidator.ts`): lança
 * `PurchaseDomainError` de fato, nunca apenas um catálogo declarativo de regras adiado para um
 * "Validation Engine" futuro. Consulta `PurchasePolicy` (puro) antes de decidir se lança.
 */
export class PurchaseValidator {
  /** Validação de `Money`, reutilizada por qualquer Service que negocie custo. */
  ensureValidMoney(money: Money): void {
    if (!isValidMoney(money)) {
      throw new InvalidMoneyError();
    }
  }

  /** Validação de `ReceivingLine`. */
  ensureValidReceivingLine(line: ReceivingLine): void {
    if (!isValidReceivingLine(line)) {
      throw new InvalidReceivingLineError();
    }
  }

  /** "Status" — a transição de status de Purchase Order solicitada é legítima. */
  ensurePurchaseOrderStatusTransitionAllowed(from: PurchaseStatus, to: PurchaseStatus): void {
    if (!canTransitionPurchaseOrderStatus(from, to)) {
      throw new PurchaseOrderInvalidStatusTransitionError(from, to);
    }
  }

  /** Itens só podem ser adicionados enquanto o Purchase Order ainda está em montagem. */
  ensureCanAddPurchaseOrderItem(purchaseOrderId: string, status: PurchaseStatus): void {
    if (!canAddPurchaseOrderItem(status)) {
      throw new PurchaseOrderItemAdditionNotAllowedError(purchaseOrderId, status);
    }
  }

  /**
   * Um Purchase Order acima do `ApprovalThreshold` exige uma identidade de aprovação explícita —
   * regra "PurchaseApproved explícito" (`PURCHASE_HUB.md`, Capítulo 12, ADR-PU-004).
   */
  ensureApprovalIdentityProvided(
    purchaseOrderId: string,
    total: Money,
    threshold: ApprovalThreshold,
    approvedByIdentityId: string | undefined,
  ): void {
    if (!isWithinApprovalThreshold(total, threshold) && !approvedByIdentityId) {
      throw new PurchaseOrderApprovalRequiresIdentityError(purchaseOrderId);
    }
  }

  /**
   * Nenhum Purchase Order pode ser cancelado após já possuir Receiving. `PartiallyReceived`/
   * `Received` já carregam essa informação no próprio status, então esta checagem antecede a
   * consulta genérica à máquina de estados para produzir o erro mais específico.
   */
  ensureCanCancelPurchaseOrder(purchaseOrderId: string, status: PurchaseStatus): void {
    if (status === 'PartiallyReceived' || status === 'Received') {
      throw new PurchaseOrderHasReceivingCannotCancelError(purchaseOrderId);
    }

    this.ensurePurchaseOrderStatusTransitionAllowed(status, 'Cancelled');
  }

  /** A quantidade recebida em uma linha nunca excede a quantidade ainda pendente do item. */
  ensureReceivingWithinPending(item: Pick<PurchaseOrderItem, 'purchaseOrderItemId' | 'quantityOrdered' | 'quantityReceived'>, quantityReceived: number): void {
    const pending = item.quantityOrdered - item.quantityReceived;

    if (quantityReceived > pending) {
      throw new ReceivingQuantityExceedsPendingError(item.purchaseOrderItemId);
    }
  }

  /** "Status" — a transição de status de Purchase Requisition solicitada é legítima. */
  ensureRequisitionStatusTransitionAllowed(from: PurchaseRequisitionStatus, to: PurchaseRequisitionStatus): void {
    if (!canTransitionRequisitionStatus(from, to)) {
      throw new PurchaseRequisitionInvalidStatusTransitionError(from, to);
    }
  }

  /** Apenas Requisition aprovada pode ser convertida em Purchase Order. */
  ensureRequisitionApproved(requisitionId: string, status: PurchaseRequisitionStatus): void {
    if (status !== 'Approved') {
      throw new PurchaseRequisitionNotApprovedError(requisitionId);
    }
  }

  /** Todo Produto sugerido pela Requisition precisa de um custo de aquisição negociado ao converter. */
  ensureAcquisitionCostProvided(productId: string, cost: Money | undefined): asserts cost is Money {
    if (!cost) {
      throw new MissingAcquisitionCostError(productId);
    }

    this.ensureValidMoney(cost);
  }
}
