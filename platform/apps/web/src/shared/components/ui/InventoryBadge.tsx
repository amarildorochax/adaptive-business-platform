import { Badge, type BadgeTone } from "./Badge";
import { inventoryStatus, type InventoryStatus } from "./inventoryStatus";

const LABEL: Record<InventoryStatus, string> = { "in-stock": "Em estoque", "low-stock": "Estoque baixo", "out-of-stock": "Sem estoque" };
const TONE: Record<InventoryStatus, BadgeTone> = { "in-stock": "success", "low-stock": "warning", "out-of-stock": "danger" };

export interface InventoryBadgeProps {
  readonly quantity: number;
  /** Abaixo deste valor (inclusive), o status vira "Estoque baixo". Nenhum limiar real vem de `Inventory` (o domínio nunca modelou um — ver relatório desta Sprint); `10` é apenas um padrão de exibição. */
  readonly lowStockThreshold?: number;
}

/**
 * Status de disponibilidade compacto, derivado de uma quantidade real de `Inventory` — nunca uma
 * quantidade inventada. Primeiro uso no Product Hub Workspace (FUN-104), genérico para qualquer
 * módulo futuro com o mesmo conceito de disponibilidade em estoque.
 */
export function InventoryBadge({ quantity, lowStockThreshold = 10 }: InventoryBadgeProps) {
  const status = inventoryStatus(quantity, lowStockThreshold);
  return <Badge tone={TONE[status]}>{LABEL[status]}</Badge>;
}
