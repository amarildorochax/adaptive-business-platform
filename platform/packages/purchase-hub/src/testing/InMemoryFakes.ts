import type { PurchaseOrder, PurchaseStatus } from '../PurchaseOrder';
import type { PurchaseOrderRepository } from '../PurchaseOrderRepository';
import type { PurchaseRequisition, PurchaseRequisitionStatus } from '../PurchaseRequisition';
import type { PurchaseRequisitionRepository } from '../PurchaseRequisitionRepository';
import type { Receiving } from '../Receiving';
import type { ReceivingRepository } from '../ReceivingRepository';
import type { ReorderRule } from '../ReorderRule';
import type { ReorderRuleRepository } from '../ReorderRuleRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-301, mesmo padrão de
 * `packages/supplier-hub/src/testing/InMemoryFakes.ts`). Nunca exportados pelo barrel do pacote
 * (`index.ts`) — apenas pelo subpath `@abp/purchase-hub/testing`, per `package.json`, `exports`.
 * O pacote de produção expõe apenas o contrato de Repository, nunca uma implementação de
 * persistência real — essa é escopo de IMP-302.
 */

const OPEN_STATUSES: readonly PurchaseStatus[] = ['Draft', 'PendingApproval', 'Approved', 'Sent', 'PartiallyReceived'];

export class FakePurchaseOrderRepository implements PurchaseOrderRepository {
  private readonly rows = new Map<string, PurchaseOrder>();

  async create(purchaseOrder: PurchaseOrder) {
    this.rows.set(purchaseOrder.purchaseOrderId, purchaseOrder);
    return purchaseOrder;
  }

  async update(purchaseOrder: PurchaseOrder) {
    this.rows.set(purchaseOrder.purchaseOrderId, purchaseOrder);
    return purchaseOrder;
  }

  async findById(purchaseOrderId: string) {
    return this.rows.get(purchaseOrderId);
  }

  async findBySupplier(supplierId: string) {
    return [...this.rows.values()].filter((po) => po.supplierId === supplierId);
  }

  async findByStatus(tenantId: string, status: PurchaseStatus) {
    return [...this.rows.values()].filter((po) => po.tenantId === tenantId && po.status === status);
  }

  async findOpen(tenantId: string) {
    return [...this.rows.values()].filter(
      (po) => po.tenantId === tenantId && OPEN_STATUSES.includes(po.status),
    );
  }
}

export class FakeReceivingRepository implements ReceivingRepository {
  private readonly rows: Receiving[] = [];

  async create(receiving: Receiving) {
    this.rows.push(receiving);
    return receiving;
  }

  async findByPurchaseOrder(purchaseOrderId: string) {
    return this.rows.filter((r) => r.purchaseOrderId === purchaseOrderId);
  }
}

export class FakePurchaseRequisitionRepository implements PurchaseRequisitionRepository {
  private readonly rows = new Map<string, PurchaseRequisition>();

  async create(requisition: PurchaseRequisition) {
    this.rows.set(requisition.requisitionId, requisition);
    return requisition;
  }

  async update(requisition: PurchaseRequisition) {
    this.rows.set(requisition.requisitionId, requisition);
    return requisition;
  }

  async findById(requisitionId: string) {
    return this.rows.get(requisitionId);
  }

  async findByStatus(tenantId: string, status: PurchaseRequisitionStatus) {
    return [...this.rows.values()].filter((r) => r.tenantId === tenantId && r.status === status);
  }
}

export class FakeReorderRuleRepository implements ReorderRuleRepository {
  private readonly rows = new Map<string, ReorderRule>();

  async create(rule: ReorderRule) {
    this.rows.set(rule.ruleId, rule);
    return rule;
  }

  async update(rule: ReorderRule) {
    this.rows.set(rule.ruleId, rule);
    return rule;
  }

  async findById(ruleId: string) {
    return this.rows.get(ruleId);
  }

  async findActiveByProduct(tenantId: string, productId: string) {
    return [...this.rows.values()].filter(
      (r) => r.tenantId === tenantId && r.productId === productId && r.active,
    );
  }

  async findAllActive(tenantId: string) {
    return [...this.rows.values()].filter((r) => r.tenantId === tenantId && r.active);
  }
}
