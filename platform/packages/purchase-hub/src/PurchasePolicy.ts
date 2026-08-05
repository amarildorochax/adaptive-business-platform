import type { PurchaseStatus } from './PurchaseOrder';
import type { PurchaseRequisitionStatus } from './PurchaseRequisition';
import type { ReorderRule } from './ReorderRule';

/**
 * PurchasePolicy — decisões puras de negócio do Purchase Hub, nunca lançam exceção (isso é
 * responsabilidade de `PurchaseValidator`, que consulta esta Policy antes de decidir se lança um
 * `PurchaseDomainError`). Cada função aqui é determinística e livre de efeito colateral, mesma
 * disciplina de `SupplierPolicy` (`packages/supplier-hub/src/SupplierPolicy.ts`).
 */

/**
 * Máquina de estados de `PurchaseStatus` (`PURCHASE_HUB.md`, Capítulo 5/13). `PartiallyReceived →
 * PartiallyReceived` é a única transição para o mesmo estado permitida — múltiplos recebimentos
 * parciais consecutivos mantêm o Purchase Order neste estado até a quantidade total ser atingida;
 * decisão documentada em `PurchaseOrder.ts` e em `IMP_301_PURCHASE_HUB_CORE_REPORT.md`.
 */
export function canTransitionPurchaseOrderStatus(from: PurchaseStatus, to: PurchaseStatus): boolean {
  if (from === to) {
    return from === 'PartiallyReceived';
  }

  switch (from) {
    case 'Draft':
      return to === 'PendingApproval' || to === 'Cancelled';
    case 'PendingApproval':
      return to === 'Approved' || to === 'Cancelled';
    case 'Approved':
      return to === 'Sent' || to === 'Cancelled';
    case 'Sent':
      return to === 'PartiallyReceived' || to === 'Received' || to === 'Cancelled';
    case 'PartiallyReceived':
      return to === 'Received';
    case 'Received':
    case 'Cancelled':
      return false;
  }
}

/**
 * Itens só podem ser adicionados enquanto o Purchase Order ainda está sendo montado (`Draft` ou
 * `PendingApproval`) — nunca após aprovação, envio ou qualquer recebimento (`PURCHASE_HUB.md`,
 * Capítulo 4: "garante que nenhum item seja adicionado após confirmação de recebimento total";
 * restrição adicional documentada em `PurchaseOrder.ts`).
 */
export function canAddPurchaseOrderItem(status: PurchaseStatus): boolean {
  return status === 'Draft' || status === 'PendingApproval';
}

/** Máquina de estados de `PurchaseRequisitionStatus` (`PURCHASE_HUB.md`, Capítulo 5/9). */
export function canTransitionRequisitionStatus(
  from: PurchaseRequisitionStatus,
  to: PurchaseRequisitionStatus,
): boolean {
  if (from === to) {
    return false;
  }

  switch (from) {
    case 'Open':
      return to === 'Approved' || to === 'Rejected';
    case 'Approved':
      return to === 'ConvertedToPurchaseOrder';
    case 'Rejected':
    case 'ConvertedToPurchaseOrder':
      return false;
  }
}

/**
 * Decisão pura consumida por `ReorderEvaluationService` — uma Regra dispara quando está ativa e a
 * quantidade corrente já está no ou abaixo do `thresholdQuantity` (`PURCHASE_HUB.md`, Capítulo 11).
 */
export function shouldTriggerReorder(rule: Pick<ReorderRule, 'active' | 'thresholdQuantity'>, currentQuantity: number): boolean {
  return rule.active && currentQuantity <= rule.thresholdQuantity;
}
