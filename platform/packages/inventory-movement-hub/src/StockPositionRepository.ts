import type { StockPosition } from './StockPosition';

/**
 * StockPositionRepository — contrato de persistência de Stock Position, especificado literalmente por
 * `INVENTORY_MOVEMENT_HUB.md`, Capítulo 9. `recalculate` é, deliberadamente, um método do próprio
 * Repository, não do Service que o consome — a aritmética de soma sobre o ledger é responsabilidade
 * da camada de Persistência (por exemplo, um `SUM` agregado em SQL, escopo de uma Sprint futura de
 * Persistência), nunca do Core. `StockPositionProjectionService` (`InventoryMovementManager`) apenas
 * delega a este contrato — nenhuma Entidade `StockPosition` é jamais construída por escrita direta de
 * nenhum Command externo (Capítulo 7: "Nenhum Command permite escrita direta de Stock Position").
 */
export interface StockPositionRepository {
  findByProduct(productId: string, locationId?: string): Promise<StockPosition | undefined>;
  recalculate(productId: string, locationId?: string): Promise<StockPosition>;
}
