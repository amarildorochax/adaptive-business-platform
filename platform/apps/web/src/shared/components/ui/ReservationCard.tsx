import { Bookmark } from "lucide-react";
import { StockReservationStatusBadge } from "./StockReservationStatusBadge";

export interface ReservationCardProps {
  readonly reservationId: string;
  readonly productId: string;
  readonly quantity: number;
  readonly orderId: string;
  readonly status: string;
}

/**
 * Cartão de resumo de uma Stock Reservation real (`core/inventory-movement/`, IMP-404) — comprometimento
 * temporário de quantidade, ainda sem decremento definitivo (`StockReservation`, Core, IMP-401). Todo
 * campo vem diretamente de `StockReservationResponseDto`, nunca fabricado. Mesmo padrão de
 * `PurchaseOrderCard`. Primeiro uso real no Inventory Movement Workspace (IMP-405).
 */
export function ReservationCard({ reservationId, productId, quantity, orderId, status }: ReservationCardProps) {
  return (
    <div className="purchase-card">
      <div className="purchase-card__header">
        <strong>
          <Bookmark size={14} aria-hidden="true" /> Reserva {reservationId.slice(0, 8)}
        </strong>
        <StockReservationStatusBadge status={status} />
      </div>
      <div className="purchase-card__meta">
        <span>Produto {productId.slice(0, 8)}</span>
        <span>{quantity} un.</span>
        <span>Order {orderId.slice(0, 8)}</span>
      </div>
    </div>
  );
}
