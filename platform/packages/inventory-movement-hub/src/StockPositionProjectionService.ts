import type { StockPosition } from './StockPosition';
import type { StockPositionRepository } from './StockPositionRepository';

/**
 * StockPositionProjectionService — "recalcula Stock Position a cada novo Stock Movement registrado, e
 * é o único ponto que publica InventoryAdjusted para consumo do Commerce Hub"
 * (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 10). Um dos quatro Services explicitamente nomeados por
 * aquele documento. Nunca escreve `StockPosition` diretamente — apenas delega a `recalculate` de
 * `StockPositionRepository`, cuja aritmética real (soma do ledger) é responsabilidade da camada de
 * Persistência (Capítulo 9 daquele documento — ver `StockPositionRepository.ts`).
 *
 * A publicação do Evento `InventoryAdjusted` em si acontece em `InventoryMovementManager`, não aqui —
 * este Service produz apenas a projeção, nunca o Evento, mesma separação de responsabilidade "Service
 * calcula, Manager publica" já aplicada em todo o Purchase Hub.
 */
export class StockPositionProjectionService {
  constructor(private readonly repository: StockPositionRepository) {}

  async recalculate(productId: string, locationId?: string): Promise<StockPosition> {
    return this.repository.recalculate(productId, locationId);
  }

  async get(productId: string, locationId?: string): Promise<StockPosition | undefined> {
    return this.repository.findByProduct(productId, locationId);
  }
}
