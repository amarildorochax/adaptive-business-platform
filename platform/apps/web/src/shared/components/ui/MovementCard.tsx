import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { movementDirection, type MovementDirection } from "./movementDirection";

export interface MovementCardProps {
  readonly productName: string;
  readonly label: string;
  readonly occurredAt: string;
  readonly delta?: number;
}

const DIRECTION_ICON: Record<MovementDirection, typeof ArrowUp> = { in: ArrowUp, out: ArrowDown, unknown: ArrowUpDown };
const DIRECTION_LABEL: Record<MovementDirection, string> = { in: "Entrada", out: "Saída", unknown: "Ajuste" };

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

/**
 * Cartão de uma movimentação de estoque — direção (Entrada/Saída) derivada do sinal real de `delta`,
 * já conhecido pelo Frontend no momento da própria chamada a `adjustInventory` (nunca reconstruído
 * retroativamente; `delta` ausente — ex.: a movimentação semeada no bootstrap — mostra "Ajuste" sem
 * direção, per a limitação documentada no relatório desta Sprint). Primeiro uso no Inventory
 * Workspace (FUN-105, Movimentações), genérico para qualquer módulo futuro com o mesmo conceito.
 */
export function MovementCard({ productName, label, occurredAt, delta }: MovementCardProps) {
  const direction = movementDirection(delta);
  const Icon = DIRECTION_ICON[direction];

  return (
    <div className={`movement-card movement-card--${direction}`}>
      <Icon size={16} aria-hidden="true" className="movement-card__icon" />
      <div className="movement-card__body">
        <strong>{productName}</strong>
        <span className="movement-card__label">{label}</span>
      </div>
      <div className="movement-card__meta">
        <span className="movement-card__direction">{DIRECTION_LABEL[direction]}</span>
        <span className="movement-card__time">{formatDateTime(occurredAt)}</span>
      </div>
    </div>
  );
}
