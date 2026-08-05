import { ProductionFactory, type CreateWorkCenterInput } from './ProductionFactory';
import { ProductionValidator } from './ProductionValidator';
import type { WorkCenter } from './WorkCenter';
import type { WorkCenterRepository } from './WorkCenterRepository';

/**
 * WorkCenterService — Service base do Aggregate `WorkCenter`. `PRODUCTION_HUB.md`, Capítulo 10, não
 * nomeia um Service próprio para este Aggregate (apenas `BillOfMaterialsService` e
 * `ProductionExecutionService`) — análogo a `StockLocationService`
 * (`packages/inventory-movement-hub/src/StockLocationService.ts`), complementação natural de
 * implementação para um Aggregate sem Service nomeado, não uma decisão de arquitetura nova.
 */
export class WorkCenterService {
  private readonly factory = new ProductionFactory();
  private readonly validator = new ProductionValidator();

  constructor(private readonly repository: WorkCenterRepository) {}

  async create(input: CreateWorkCenterInput): Promise<WorkCenter> {
    this.validator.ensureValidWorkCenterName(input.name);

    const workCenter = this.factory.createWorkCenter(input);
    return this.repository.save(workCenter);
  }

  async listActive(): Promise<readonly WorkCenter[]> {
    return this.repository.findActive();
  }
}
