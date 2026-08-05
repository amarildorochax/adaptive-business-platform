import type { Money } from './Money';

/**
 * ApprovalThreshold — valor monetário acima do qual um Purchase Order exige aprovação humana
 * explícita antes de `SendPurchaseOrderToSupplier`; abaixo dele, o Automation Engine pode invocar o
 * mesmo `ApprovePurchaseOrder` por conta própria, "nunca por decisão interna do Purchase Hub"
 * (`PURCHASE_HUB.md`, Capítulo 6 e ADR-PU-004). Por ser configurável por Tenant e não existir ainda
 * nenhum armazenamento real de configuração por Tenant nesta plataforma, o Purchase Hub nunca lê um
 * `ApprovalThreshold` de um repositório próprio — todo método que precisa dele recebe-o como
 * parâmetro explícito do chamador (`PurchaseManager.approvePurchaseOrder`), decisão documentada em
 * `IMP_301_PURCHASE_HUB_CORE_REPORT.md`.
 */
export interface ApprovalThreshold {
  readonly limit: Money;
}

export function isWithinApprovalThreshold(total: Money, threshold: ApprovalThreshold): boolean {
  return total.currencyCode === threshold.limit.currencyCode && total.amount <= threshold.limit.amount;
}
