import type { StockLocation } from './StockLocation';

/**
 * StockLocationRepository — contrato de persistência de Stock Location. `INVENTORY_MOVEMENT_HUB.md`,
 * Capítulo 9, não especifica este Repository (apenas os quatro referentes a Movement/Position/
 * Reservation/AlertRule) — extensão necessária para o Command `CreateStockLocation`, Capítulo 7, ter
 * onde persistir; mesma disciplina de complementação natural de implementação já usada por
 * `SupplierContractRepository` além do mínimo nomeado em `SUPPLIER_HUB.md`.
 */
export interface StockLocationRepository {
  create(location: StockLocation): Promise<StockLocation>;
  findById(locationId: string): Promise<StockLocation | undefined>;
  findAllActive(tenantId: string): Promise<readonly StockLocation[]>;
}
