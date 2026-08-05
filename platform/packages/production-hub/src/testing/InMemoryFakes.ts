import type { BillOfMaterials } from '../BillOfMaterials';
import type { BillOfMaterialsRepository } from '../BillOfMaterialsRepository';
import type { ProductionOrder, ProductionStatus } from '../ProductionOrder';
import type { ProductionOrderRepository } from '../ProductionOrderRepository';
import type { WorkCenter } from '../WorkCenter';
import type { WorkCenterRepository } from '../WorkCenterRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-501, mesmo padrão de
 * `packages/inventory-movement-hub/src/testing/InMemoryFakes.ts`). Nunca exportados pelo barrel do
 * pacote (`index.ts`) — apenas pelo subpath `@abp/production-hub/testing`, per `package.json`,
 * `exports`. O pacote de produção expõe apenas o contrato de Repository, nunca uma implementação de
 * persistência real — essa é escopo de uma Sprint futura (IMP-502).
 */

export class FakeBillOfMaterialsRepository implements BillOfMaterialsRepository {
  private readonly rows = new Map<string, BillOfMaterials>();

  async findActiveByProduct(outputProductId: string) {
    return [...this.rows.values()].find((bom) => bom.outputProductId === outputProductId && bom.status === 'Active');
  }

  async findById(billOfMaterialsId: string) {
    return this.rows.get(billOfMaterialsId);
  }

  async save(bom: BillOfMaterials) {
    this.rows.set(bom.billOfMaterialsId, bom);
    return bom;
  }
}

export class FakeProductionOrderRepository implements ProductionOrderRepository {
  private readonly rows = new Map<string, ProductionOrder>();

  async findById(productionOrderId: string) {
    return this.rows.get(productionOrderId);
  }

  async findByStatus(status: ProductionStatus) {
    return [...this.rows.values()].filter((order) => order.status === status);
  }

  async findByOrigin(orderId: string) {
    return [...this.rows.values()].filter((order) => order.orderId === orderId);
  }

  async save(order: ProductionOrder) {
    this.rows.set(order.productionOrderId, order);
    return order;
  }
}

export class FakeWorkCenterRepository implements WorkCenterRepository {
  private readonly rows = new Map<string, WorkCenter>();

  async findActive() {
    return [...this.rows.values()].filter((workCenter) => workCenter.active);
  }

  async save(workCenter: WorkCenter) {
    this.rows.set(workCenter.workCenterId, workCenter);
    return workCenter;
  }
}
