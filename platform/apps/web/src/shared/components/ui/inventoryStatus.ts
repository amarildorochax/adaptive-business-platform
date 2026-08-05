export type InventoryStatus = "in-stock" | "low-stock" | "out-of-stock";

/** Deriva o status de disponibilidade a partir de uma quantidade real de `Inventory` — nunca uma quantidade inventada. Compartilhado por `InventoryBadge`/`InventoryIndicator`. */
export function inventoryStatus(quantity: number, lowStockThreshold: number): InventoryStatus {
  if (quantity <= 0) return "out-of-stock";
  if (quantity <= lowStockThreshold) return "low-stock";
  return "in-stock";
}
