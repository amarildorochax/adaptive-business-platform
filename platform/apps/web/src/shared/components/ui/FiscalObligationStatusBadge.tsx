import { Badge, type BadgeTone } from "./Badge";

export interface FiscalObligationStatusBadgeProps {
  readonly status: string;
}

const STATUS_TONE: Record<string, BadgeTone> = {
  Pending: "neutral",
  Fulfilled: "success",
  Overdue: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  Pending: "Pendente",
  Fulfilled: "Cumprida",
  Overdue: "Vencida",
};

/**
 * Rótulo de status de uma Fiscal Obligation — mesmo padrão de `FiscalDocumentStatusBadge`. Sobre
 * `FiscalObligationStatus` real (`@abp/fiscal-hub`, IMP-601) — nunca um valor arbitrário; um status
 * desconhecido cai em tom neutro e no próprio texto recebido, nunca oculta a informação.
 */
export function FiscalObligationStatusBadge({ status }: FiscalObligationStatusBadgeProps) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{STATUS_LABEL[status] ?? status}</Badge>;
}
