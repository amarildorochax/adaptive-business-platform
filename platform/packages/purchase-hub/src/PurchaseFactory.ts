import type { Money } from './Money';
import type { PurchaseOrder } from './PurchaseOrder';
import type { PurchaseOrderItem } from './PurchaseOrderItem';
import type { PurchaseRequisition, PurchaseRequisitionLine, PurchaseRequisitionOrigin } from './PurchaseRequisition';
import type { ReceivingLine } from './ReceivingLine';
import type { Receiving } from './Receiving';
import type { ReorderRule } from './ReorderRule';

/**
 * PurchaseFactory — construção de cada Entidade do Purchase Hub, isolando geração de identificador
 * e atribuição de padrão (`status: 'Draft'` para todo novo Purchase Order, `items: []` inicial,
 * `active: true` para toda nova Reorder Rule) do restante da lógica de `Service`, mesma disciplina
 * de responsabilidade única já exigida por IMP-201/IMP-301.
 */
export interface CreatePurchaseOrderInput {
  readonly tenantId: string;
  readonly supplierId: string;
  readonly requisitionId?: string;
}

export interface CreatePurchaseOrderItemInput {
  readonly purchaseOrderId: string;
  readonly productId: string;
  readonly quantityOrdered: number;
  readonly acquisitionCost: Money;
}

export interface CreateReceivingInput {
  readonly purchaseOrderId: string;
  readonly tenantId: string;
  readonly lines: readonly ReceivingLine[];
  readonly receivedAt: Date;
}

export interface CreatePurchaseRequisitionInput {
  readonly tenantId: string;
  readonly origin: PurchaseRequisitionOrigin;
  readonly lines: readonly PurchaseRequisitionLine[];
}

export interface CreateReorderRuleInput {
  readonly tenantId: string;
  readonly productId: string;
  readonly thresholdQuantity: number;
  readonly reorderQuantity: number;
  readonly preferredSupplierId?: string;
}

export class PurchaseFactory {
  createPurchaseOrder(input: CreatePurchaseOrderInput): PurchaseOrder {
    const now = new Date();

    return {
      purchaseOrderId: crypto.randomUUID(),
      tenantId: input.tenantId,
      supplierId: input.supplierId,
      requisitionId: input.requisitionId,
      status: 'Draft',
      items: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  createPurchaseOrderItem(input: CreatePurchaseOrderItemInput): PurchaseOrderItem {
    return {
      purchaseOrderItemId: crypto.randomUUID(),
      purchaseOrderId: input.purchaseOrderId,
      productId: input.productId,
      quantityOrdered: input.quantityOrdered,
      quantityReceived: 0,
      acquisitionCost: input.acquisitionCost,
      status: 'Pending',
    };
  }

  createReceiving(input: CreateReceivingInput): Receiving {
    return {
      receivingId: crypto.randomUUID(),
      purchaseOrderId: input.purchaseOrderId,
      tenantId: input.tenantId,
      lines: input.lines,
      receivedAt: input.receivedAt,
    };
  }

  createPurchaseRequisition(input: CreatePurchaseRequisitionInput): PurchaseRequisition {
    const now = new Date();

    return {
      requisitionId: crypto.randomUUID(),
      tenantId: input.tenantId,
      origin: input.origin,
      lines: input.lines,
      status: 'Open',
      createdAt: now,
      updatedAt: now,
    };
  }

  createReorderRule(input: CreateReorderRuleInput): ReorderRule {
    const now = new Date();

    return {
      ruleId: crypto.randomUUID(),
      tenantId: input.tenantId,
      productId: input.productId,
      thresholdQuantity: input.thresholdQuantity,
      reorderQuantity: input.reorderQuantity,
      preferredSupplierId: input.preferredSupplierId,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
  }
}
