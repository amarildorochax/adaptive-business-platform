import type { Inventory } from './Inventory';

/** Contrato de persistência de Inventory — apenas o contrato, per Etapa 7. */
export interface InventoryRepository {
  create(inventory: Inventory): Promise<Inventory>;
  update(inventory: Inventory): Promise<Inventory>;
  get(inventoryId: string): Promise<Inventory | undefined>;
  findByProduct(productId: string, variantId?: string): Promise<Inventory | undefined>;
}
