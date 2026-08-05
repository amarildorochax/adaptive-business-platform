import { Badge, type BadgeTone } from "./Badge";

export type ReservationStatus = "reserved" | "available" | "released";

const LABEL: Record<ReservationStatus, string> = { reserved: "Reservado", available: "Disponível", released: "Liberado" };
const TONE: Record<ReservationStatus, BadgeTone> = { reserved: "warning", available: "success", released: "neutral" };

export interface ReservationBadgeProps {
  readonly status: ReservationStatus;
}

/**
 * Rótulo de status de uma reserva de estoque — genérico e pronto para reuso, mas **sem nenhum dado
 * real por trás nesta Sprint**: nenhum conceito de Reservation existe em `packages/commerce-hub`
 * (`Inventory` não tem nenhum campo reservado/em uso; o fluxo de reserva-no-Checkout descrito em
 * `COMMERCE_HUB_ARCHITECTURE.md` nunca foi implementado, ver relatório desta Sprint, seção
 * "Reservas"). Mesmo padrão já usado por `CompositionCard` (FUN-104) — o componente existe pronto
 * para o dia em que essa modelagem existir; nenhuma seção do Inventory Workspace o instancia com
 * dado fabricado.
 */
export function ReservationBadge({ status }: ReservationBadgeProps) {
  return <Badge tone={TONE[status]}>{LABEL[status]}</Badge>;
}
