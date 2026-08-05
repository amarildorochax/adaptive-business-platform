import { InventoryFactory, type CreateStockLocationInput } from './InventoryFactory';
import { InventoryValidator } from './InventoryValidator';
import type { StockLocation } from './StockLocation';
import type { StockLocationRepository } from './StockLocationRepository';

/**
 * StockLocationService — Service base do Aggregate `StockLocation`. `INVENTORY_MOVEMENT_HUB.md`,
 * Capítulo 10, não nomeia um Service próprio para este Aggregate (apenas os quatro já cobertos por
 * `StockMovementRecordingService`/`StockPositionProjectionService`/`StockReservationService`/
 * `StockAlertEvaluationService`) — análogo a `SupplierService`
 * (`packages/supplier-hub/src/SupplierService.ts`) e `PurchaseRequisitionService`
 * (`packages/purchase-hub/src/PurchaseRequisitionService.ts`), ambos complementações naturais de
 * implementação para um Aggregate sem Service nomeado, não uma decisão de arquitetura nova.
 */
export class StockLocationService {
  private readonly factory = new InventoryFactory();
  private readonly validator = new InventoryValidator();

  constructor(private readonly repository: StockLocationRepository) {}

  async create(input: CreateStockLocationInput): Promise<StockLocation> {
    this.validator.ensureValidStockLocationName(input.name);

    const location = this.factory.createStockLocation(input);
    return this.repository.create(location);
  }

  async get(locationId: string): Promise<StockLocation | undefined> {
    return this.repository.findById(locationId);
  }

  async listActive(tenantId: string): Promise<readonly StockLocation[]> {
    return this.repository.findAllActive(tenantId);
  }
}
