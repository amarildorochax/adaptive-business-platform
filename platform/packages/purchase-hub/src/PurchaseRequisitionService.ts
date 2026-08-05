import { PurchaseFactory, type CreatePurchaseRequisitionInput } from './PurchaseFactory';
import type { Money } from './Money';
import { PurchaseRequisitionNotFoundError } from './PurchaseDomainError';
import type { PurchaseOrder } from './PurchaseOrder';
import type { PurchaseOrderRepository } from './PurchaseOrderRepository';
import type { PurchaseRequisition } from './PurchaseRequisition';
import type { PurchaseRequisitionRepository } from './PurchaseRequisitionRepository';
import { PurchaseValidator } from './PurchaseValidator';

/**
 * PurchaseRequisitionService — o Service base do Aggregate Root `PurchaseRequisition` (criação,
 * aprovação, rejeição, conversão em Purchase Order). `PURCHASE_HUB.md`, Capítulo 11, não nomeia um
 * Service próprio para este Aggregate — análogo a `SupplierService` em
 * `packages/supplier-hub/src/SupplierService.ts`, uma complementação natural de implementação para
 * o Aggregate Root, não uma decisão de arquitetura nova; documentado em
 * `IMP_301_PURCHASE_HUB_CORE_REPORT.md`.
 *
 * `convertToPurchaseOrder` depende também de `PurchaseOrderRepository` — mesmo padrão de
 * `SupplierCatalogService` aceitando dois Repositories quando a operação naturalmente atravessa dois
 * Aggregates do mesmo Hub (`packages/supplier-hub/src/SupplierCatalogService.ts`).
 */
export class PurchaseRequisitionService {
  private readonly factory = new PurchaseFactory();
  private readonly validator: PurchaseValidator = new PurchaseValidator();

  constructor(
    private readonly repository: PurchaseRequisitionRepository,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
  ) {}

  async create(input: CreatePurchaseRequisitionInput): Promise<PurchaseRequisition> {
    const requisition = this.factory.createPurchaseRequisition(input);
    return this.repository.create(requisition);
  }

  async approve(requisitionId: string): Promise<PurchaseRequisition> {
    const existing = await this.getOrThrow(requisitionId);
    this.validator.ensureRequisitionStatusTransitionAllowed(existing.status, 'Approved');

    return this.repository.update({ ...existing, status: 'Approved', updatedAt: new Date() });
  }

  async reject(requisitionId: string): Promise<PurchaseRequisition> {
    const existing = await this.getOrThrow(requisitionId);
    this.validator.ensureRequisitionStatusTransitionAllowed(existing.status, 'Rejected');

    return this.repository.update({ ...existing, status: 'Rejected', updatedAt: new Date() });
  }

  /**
   * O custo de aquisição de cada Produto sugerido só é conhecido ao negociar com o Fornecedor
   * escolhido — nunca presente na própria `PurchaseRequisitionLine`. `acquisitionCosts` mapeia
   * `productId → Money`, fornecido explicitamente pelo chamador (`PurchaseManager`).
   */
  async convertToPurchaseOrder(
    requisitionId: string,
    supplierId: string,
    acquisitionCosts: ReadonlyMap<string, Money>,
  ): Promise<{ readonly requisition: PurchaseRequisition; readonly purchaseOrder: PurchaseOrder }> {
    const existing = await this.getOrThrow(requisitionId);
    this.validator.ensureRequisitionApproved(requisitionId, existing.status);

    const purchaseOrder = this.factory.createPurchaseOrder({
      tenantId: existing.tenantId,
      supplierId,
      requisitionId,
    });

    const items = existing.lines.map((line) => {
      const cost = acquisitionCosts.get(line.productId);
      this.validator.ensureAcquisitionCostProvided(line.productId, cost);

      return this.factory.createPurchaseOrderItem({
        purchaseOrderId: purchaseOrder.purchaseOrderId,
        productId: line.productId,
        quantityOrdered: line.suggestedQuantity,
        acquisitionCost: cost,
      });
    });

    const createdPurchaseOrder = await this.purchaseOrderRepository.create({
      ...purchaseOrder,
      items,
      status: items.length > 0 ? 'PendingApproval' : 'Draft',
    });

    const updatedRequisition = await this.repository.update({
      ...existing,
      status: 'ConvertedToPurchaseOrder',
      purchaseOrderId: createdPurchaseOrder.purchaseOrderId,
      updatedAt: new Date(),
    });

    return { requisition: updatedRequisition, purchaseOrder: createdPurchaseOrder };
  }

  async get(requisitionId: string): Promise<PurchaseRequisition | undefined> {
    return this.repository.findById(requisitionId);
  }

  async listByStatus(tenantId: string, status: PurchaseRequisition['status']): Promise<readonly PurchaseRequisition[]> {
    return this.repository.findByStatus(tenantId, status);
  }

  private async getOrThrow(requisitionId: string): Promise<PurchaseRequisition> {
    const existing = await this.repository.findById(requisitionId);

    if (!existing) {
      throw new PurchaseRequisitionNotFoundError(requisitionId);
    }

    return existing;
  }
}
