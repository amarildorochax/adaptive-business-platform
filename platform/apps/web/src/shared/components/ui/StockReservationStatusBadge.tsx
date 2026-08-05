import { Badge, type BadgeTone } from "./Badge";

export interface StockReservationStatusBadgeProps {
  readonly status: string;
}

const STATUS_TONE: Record<string, BadgeTone> = {
  Active: "warning",
  Released: "neutral",
  ConvertedToMovement: "success",
};

const STATUS_LABEL: Record<string, string> = {
  Active: "Ativa",
  Released: "Liberada",
  ConvertedToMovement: "Convertida em Saída",
};

/**
 * Rótulo de status de uma Stock Reservation real (`StockReservationStatus`, Core, IMP-401) — mesmo
 * padrão de `PurchaseStatusBadge`/`RequisitionStatusBadge`. Nunca confundir com `ReservationBadge`
 * (`shared/components/ui/`), componente legado do Inventory Workspace (FUN-105) — valores
 * `reserved`/`available`/`released` sem nenhum dado real por trás (`packages/commerce-hub` nunca
 * modelou Reservation), forma e domínio totalmente distintos de `StockReservationStatus` real
 * (`Active`/`Released`/`ConvertedToMovement`); nunca reaproveitado por este Workspace.
 */
export function StockReservationStatusBadge({ status }: StockReservationStatusBadgeProps) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{STATUS_LABEL[status] ?? status}</Badge>;
}
