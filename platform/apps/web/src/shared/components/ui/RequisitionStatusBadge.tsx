import { Badge, type BadgeTone } from "./Badge";

export interface RequisitionStatusBadgeProps {
  readonly status: string;
}

const STATUS_TONE: Record<string, BadgeTone> = {
  Open: "warning",
  Approved: "info",
  Rejected: "danger",
  ConvertedToPurchaseOrder: "success",
};

const STATUS_LABEL: Record<string, string> = {
  Open: "Aberta",
  Approved: "Aprovada",
  Rejected: "Rejeitada",
  ConvertedToPurchaseOrder: "Convertida em Pedido",
};

/**
 * Rótulo de status de uma Purchase Requisition — `PurchaseRequisitionStatus` tem um enum distinto do
 * de `PurchaseOrder` (`@abp/purchase-hub`, IMP-301), por isso um badge próprio, nunca reutilizando
 * `PurchaseStatusBadge` com um mapeamento incompatível. Mesmo padrão de `SupplierStatusBadge`/
 * `PurchaseStatusBadge` — status desconhecido cai em tom neutro e no próprio texto recebido.
 */
export function RequisitionStatusBadge({ status }: RequisitionStatusBadgeProps) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{STATUS_LABEL[status] ?? status}</Badge>;
}
