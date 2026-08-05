import type { ApprovalThreshold } from './ApprovalThreshold';
import { PurchaseFactory, type CreatePurchaseOrderInput, type CreatePurchaseOrderItemInput } from './PurchaseFactory';
import type { Money } from './Money';
import type { PurchaseOrder } from './PurchaseOrder';
import { PurchaseOrderNotFoundError } from './PurchaseDomainError';
import type { PurchaseOrderRepository } from './PurchaseOrderRepository';
import { PurchaseValidator } from './PurchaseValidator';

/**
 * PurchaseOrderService — o Service base do Aggregate Root `PurchaseOrder` (criação, adição de item,
 * aprovação, envio ao Fornecedor, cancelamento). Um dos três Services explicitamente nomeados por
 * `PURCHASE_HUB.md`, Capítulo 11.
 */
export class PurchaseOrderService {
  private readonly factory = new PurchaseFactory();
  private readonly validator = new PurchaseValidator();

  constructor(private readonly repository: PurchaseOrderRepository) {}

  async create(input: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
    const purchaseOrder = this.factory.createPurchaseOrder(input);
    return this.repository.create(purchaseOrder);
  }

  async addItem(
    purchaseOrderId: string,
    input: Omit<CreatePurchaseOrderItemInput, 'purchaseOrderId'>,
  ): Promise<PurchaseOrder> {
    const existing = await this.getOrThrow(purchaseOrderId);
    this.validator.ensureCanAddPurchaseOrderItem(purchaseOrderId, existing.status);
    this.validator.ensureValidMoney(input.acquisitionCost);

    const item = this.factory.createPurchaseOrderItem({ ...input, purchaseOrderId });
    const nextStatus = existing.status === 'Draft' ? 'PendingApproval' : existing.status;

    if (nextStatus !== existing.status) {
      this.validator.ensurePurchaseOrderStatusTransitionAllowed(existing.status, nextStatus);
    }

    return this.repository.update({
      ...existing,
      items: [...existing.items, item],
      status: nextStatus,
      updatedAt: new Date(),
    });
  }

  async approve(
    purchaseOrderId: string,
    threshold: ApprovalThreshold,
    approvedByIdentityId?: string,
  ): Promise<PurchaseOrder> {
    const existing = await this.getOrThrow(purchaseOrderId);
    this.validator.ensurePurchaseOrderStatusTransitionAllowed(existing.status, 'Approved');

    const total = this.computeTotal(existing);
    this.validator.ensureApprovalIdentityProvided(purchaseOrderId, total, threshold, approvedByIdentityId);

    return this.repository.update({
      ...existing,
      status: 'Approved',
      approvedByIdentityId,
      updatedAt: new Date(),
    });
  }

  async sendToSupplier(purchaseOrderId: string): Promise<PurchaseOrder> {
    const existing = await this.getOrThrow(purchaseOrderId);
    this.validator.ensurePurchaseOrderStatusTransitionAllowed(existing.status, 'Sent');

    return this.repository.update({ ...existing, status: 'Sent', updatedAt: new Date() });
  }

  async cancel(purchaseOrderId: string): Promise<PurchaseOrder> {
    const existing = await this.getOrThrow(purchaseOrderId);
    this.validator.ensureCanCancelPurchaseOrder(purchaseOrderId, existing.status);

    return this.repository.update({ ...existing, status: 'Cancelled', updatedAt: new Date() });
  }

  async get(purchaseOrderId: string): Promise<PurchaseOrder | undefined> {
    return this.repository.findById(purchaseOrderId);
  }

  async listBySupplier(supplierId: string): Promise<readonly PurchaseOrder[]> {
    return this.repository.findBySupplier(supplierId);
  }

  async listOpen(tenantId: string): Promise<readonly PurchaseOrder[]> {
    return this.repository.findOpen(tenantId);
  }

  /** Soma o custo de aquisição de cada item já adicionado — assume moeda única por Purchase Order. */
  private computeTotal(purchaseOrder: PurchaseOrder): Money {
    const currencyCode = purchaseOrder.items[0]?.acquisitionCost.currencyCode ?? 'BRL';
    const amount = purchaseOrder.items.reduce(
      (sum, item) => sum + item.acquisitionCost.amount * item.quantityOrdered,
      0,
    );

    return { amount, currencyCode };
  }

  private async getOrThrow(purchaseOrderId: string): Promise<PurchaseOrder> {
    const existing = await this.repository.findById(purchaseOrderId);

    if (!existing) {
      throw new PurchaseOrderNotFoundError(purchaseOrderId);
    }

    return existing;
  }
}
