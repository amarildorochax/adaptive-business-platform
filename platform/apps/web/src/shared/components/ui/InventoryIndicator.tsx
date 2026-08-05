import { inventoryStatus } from "./inventoryStatus";

export interface InventoryIndicatorProps {
  readonly quantity: number;
  readonly lowStockThreshold?: number;
  readonly label?: string;
}

/**
 * Indicador de estoque com a quantidade real em destaque — distinto de `InventoryBadge` (apenas o
 * status compacto) por expor o número em si, útil em painéis onde a quantidade exata importa (ex.:
 * Estoque, Visão Geral). Primeiro uso no Product Hub Workspace (FUN-104), genérico para qualquer
 * módulo futuro com o mesmo conceito.
 */
export function InventoryIndicator({ quantity, lowStockThreshold = 10, label = "unidades" }: InventoryIndicatorProps) {
  const status = inventoryStatus(quantity, lowStockThreshold);

  return (
    <div className={`inventory-indicator inventory-indicator--${status}`}>
      <strong className="inventory-indicator__value">{quantity}</strong>
      <span className="inventory-indicator__label">{label}</span>
    </div>
  );
}
