import type { ProductionOrder, ProductionStatus } from './ProductionOrder';

/**
 * ProductionOrderRepository — contrato de persistência de ProductionOrder, especificado literalmente
 * por `PRODUCTION_HUB.md`, Capítulo 9. `save` é o único método de escrita — usado tanto para criar
 * quanto para atualizar (transição de status, adição de `ProductionConsumption`/`ProductionOutput`),
 * mesma disciplina de `ProductionOrder` sendo um Aggregate com ciclo de vida próprio, mas sem método
 * de escrita segmentado por operação (diferente de `StockMovementRepository.append`, que reforça
 * append-only já no nome do contrato — `ProductionOrder` não é um ledger append-only, é uma máquina de
 * estados, mesma disciplina de `PurchaseOrderRepository`).
 */
export interface ProductionOrderRepository {
  findById(productionOrderId: string): Promise<ProductionOrder | undefined>;
  findByStatus(status: ProductionStatus): Promise<readonly ProductionOrder[]>;
  findByOrigin(orderId: string): Promise<readonly ProductionOrder[]>;
  save(order: ProductionOrder): Promise<ProductionOrder>;
}
