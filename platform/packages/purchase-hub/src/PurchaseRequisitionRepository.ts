import type { PurchaseRequisition, PurchaseRequisitionStatus } from './PurchaseRequisition';

/**
 * PurchaseRequisitionRepository — contrato de persistência de Purchase Requisition. Interface
 * apenas — nenhuma implementação é definida por esta Sprint; persistência é escopo de IMP-302
 * (`PURCHASE_HUB.md`, Capítulo 10).
 */
export interface PurchaseRequisitionRepository {
  create(requisition: PurchaseRequisition): Promise<PurchaseRequisition>;
  update(requisition: PurchaseRequisition): Promise<PurchaseRequisition>;
  findById(requisitionId: string): Promise<PurchaseRequisition | undefined>;
  findByStatus(tenantId: string, status: PurchaseRequisitionStatus): Promise<readonly PurchaseRequisition[]>;
}
