import type { WorkCenter } from './WorkCenter';

/**
 * WorkCenterRepository — contrato de persistência de WorkCenter, especificado literalmente por
 * `PRODUCTION_HUB.md`, Capítulo 9. `findActive` não recebe `tenantId` — mesma limitação herdada da
 * arquitetura documentada em `BillOfMaterialsRepository.ts`.
 */
export interface WorkCenterRepository {
  findActive(): Promise<readonly WorkCenter[]>;
  save(workCenter: WorkCenter): Promise<WorkCenter>;
}
