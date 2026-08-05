import type { PurchaseOrder, PurchaseStatus } from './PurchaseOrder';

/**
 * PurchaseOrderRepository — contrato de persistência de Purchase Order. Interface apenas — nenhuma
 * implementação (SQLite, in-memory de produção) é definida por esta Sprint; persistência é escopo de
 * IMP-302 (`PURCHASE_HUB.md`, Capítulo 10).
 */
export interface PurchaseOrderRepository {
  create(purchaseOrder: PurchaseOrder): Promise<PurchaseOrder>;
  update(purchaseOrder: PurchaseOrder): Promise<PurchaseOrder>;
  findById(purchaseOrderId: string): Promise<PurchaseOrder | undefined>;
  findBySupplier(supplierId: string): Promise<readonly PurchaseOrder[]>;
  findByStatus(tenantId: string, status: PurchaseStatus): Promise<readonly PurchaseOrder[]>;
  findOpen(tenantId: string): Promise<readonly PurchaseOrder[]>;
}
