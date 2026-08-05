import { ArrowRightLeft } from "lucide-react";
import { MovementBadge } from "./MovementBadge";

export interface StockMovementCardProps {
  readonly movementId: string;
  readonly productId: string;
  readonly quantityDelta: number;
  readonly origin: string;
  readonly occurredAt: string;
  readonly locationId?: string;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

/**
 * Cartão de resumo de um Stock Movement real — fato imutável do ledger (`core/inventory-movement/`,
 * IMP-404). Todo campo vem diretamente de `StockMovementResponseDto`, nunca fabricado. Mesmo padrão
 * de `PurchaseOrderCard`/`ReceivingCard` (Purchase Hub) — genérico e reutilizável (Movimentações,
 * Visão Geral). Este cartão nunca é instanciado com nenhuma ação de edição/exclusão — o Ledger não
 * permite nenhuma das duas (`INVENTORY_MOVEMENT_HUB.md`, princípio de imutabilidade, reforçado em
 * Core/Persistência/HTTP/Frontend, IMP-401/402/403/404).
 */
export function StockMovementCard({ movementId, productId, quantityDelta, origin, occurredAt, locationId }: StockMovementCardProps) {
  return (
    <div className="purchase-card">
      <div className="purchase-card__header">
        <strong>
          <ArrowRightLeft size={14} aria-hidden="true" /> Movimento {movementId.slice(0, 8)}
        </strong>
        <MovementBadge origin={origin} quantityDelta={quantityDelta} />
      </div>
      <div className="purchase-card__meta">
        <span>Produto {productId.slice(0, 8)}</span>
        <span>{quantityDelta > 0 ? "+" : ""}{quantityDelta} un.</span>
        {locationId && <span>Local {locationId.slice(0, 8)}</span>}
        <span>{formatDateTime(occurredAt)}</span>
      </div>
    </div>
  );
}
