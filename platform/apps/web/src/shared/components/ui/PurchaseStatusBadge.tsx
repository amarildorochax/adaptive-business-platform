import { Badge, type BadgeTone } from "./Badge";

export interface PurchaseStatusBadgeProps {
  readonly status: string;
}

const STATUS_TONE: Record<string, BadgeTone> = {
  Draft: "neutral",
  PendingApproval: "warning",
  Approved: "info",
  Sent: "primary",
  PartiallyReceived: "warning",
  Received: "success",
  Cancelled: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  Draft: "Rascunho",
  PendingApproval: "Aguardando Aprovação",
  Approved: "Aprovado",
  Sent: "Enviado",
  PartiallyReceived: "Recebido Parcialmente",
  Received: "Recebido",
  Cancelled: "Cancelado",
};

/**
 * Rótulo de status de um Purchase Order — mesmo padrão de `SupplierStatusBadge` (IMP-205, Badge +
 * mapeamento de tom semântico fixo por domínio). Sobre `PurchaseStatus` real (`@abp/purchase-hub`,
 * IMP-301) — nunca um valor arbitrário; um status desconhecido cai em tom neutro e no próprio texto
 * recebido, nunca oculta a informação.
 */
export function PurchaseStatusBadge({ status }: PurchaseStatusBadgeProps) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{STATUS_LABEL[status] ?? status}</Badge>;
}
