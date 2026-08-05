import type { SupplierPerformanceRecord } from './SupplierPerformanceRecord';

/**
 * SupplierPerformanceRepository — contrato de persistência de SupplierPerformanceRecord.
 * `append`, e não `save`, para reforçar já no contrato que este registro é imutável assim que
 * criado — mesmo padrão já adotado por `StockMovementRepository.append` em
 * `INVENTORY_MOVEMENT_HUB.md`, Capítulo 9. Interface apenas — nenhuma implementação é definida por
 * esta Sprint.
 */
export interface SupplierPerformanceRepository {
  append(record: SupplierPerformanceRecord): Promise<SupplierPerformanceRecord>;
  findBySupplier(supplierId: string): Promise<readonly SupplierPerformanceRecord[]>;
}
