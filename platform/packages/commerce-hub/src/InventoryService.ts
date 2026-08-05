import type { Inventory } from './Inventory';
import type { InventoryRepository } from './InventoryRepository';

/**
 * InventoryService — nenhum precedente legado foi encontrado. Nenhuma emissão de Evento aqui —
 * responsabilidade exclusiva de CommerceManager (`StockUpdated`). Nunca ajustado por nenhum Hub além
 * do Commerce Hub (Capítulo 25, "nem mesmo o Finance Hub").
 */
export class InventoryService {
  constructor(private readonly repository: InventoryRepository) {}

  async adjust(productId: string, delta: number, variantId?: string): Promise<Inventory> {
    const existing = await this.repository.findByProduct(productId, variantId);

    if (existing) {
      return this.repository.update({ ...existing, quantity: existing.quantity + delta, updatedAt: new Date() });
    }

    return this.repository.create({
      inventoryId: crypto.randomUUID(),
      productId,
      variantId,
      quantity: delta,
      updatedAt: new Date(),
    });
  }

  async findByProduct(productId: string, variantId?: string): Promise<Inventory | undefined> {
    return this.repository.findByProduct(productId, variantId);
  }
}
