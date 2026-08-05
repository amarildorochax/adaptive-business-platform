import { describe, expect, it } from 'vitest';
import { PurchaseFactory } from './PurchaseFactory';

describe('PurchaseFactory', () => {
  const factory = new PurchaseFactory();

  it('createPurchaseOrder gera status Draft e items vazio por padrão', () => {
    const purchaseOrder = factory.createPurchaseOrder({ tenantId: 'tenant-1', supplierId: 'supplier-1' });

    expect(purchaseOrder.status).toBe('Draft');
    expect(purchaseOrder.items).toEqual([]);
    expect(purchaseOrder.requisitionId).toBeUndefined();
    expect(purchaseOrder.purchaseOrderId).toBeTruthy();
    expect(purchaseOrder.createdAt).toEqual(purchaseOrder.updatedAt);
  });

  it('createPurchaseOrderItem gera status Pending e quantityReceived zero por padrão', () => {
    const item = factory.createPurchaseOrderItem({
      purchaseOrderId: 'po-1',
      productId: 'product-1',
      quantityOrdered: 10,
      acquisitionCost: { amount: 5, currencyCode: 'BRL' },
    });

    expect(item.status).toBe('Pending');
    expect(item.quantityReceived).toBe(0);
    expect(item.purchaseOrderItemId).toBeTruthy();
  });

  it('createReceiving preserva purchaseOrderId, linhas e momento de recebimento informados', () => {
    const receivedAt = new Date('2026-02-01');
    const receiving = factory.createReceiving({
      purchaseOrderId: 'po-1',
      tenantId: 'tenant-1',
      lines: [{ purchaseOrderItemId: 'item-1', quantityReceived: 5 }],
      receivedAt,
    });

    expect(receiving.purchaseOrderId).toBe('po-1');
    expect(receiving.lines).toHaveLength(1);
    expect(receiving.receivedAt).toBe(receivedAt);
    expect(receiving.receivingId).toBeTruthy();
  });

  it('createPurchaseRequisition gera status Open por padrão', () => {
    const requisition = factory.createPurchaseRequisition({
      tenantId: 'tenant-1',
      origin: 'Manual',
      lines: [{ productId: 'product-1', suggestedQuantity: 20 }],
    });

    expect(requisition.status).toBe('Open');
    expect(requisition.purchaseOrderId).toBeUndefined();
    expect(requisition.requisitionId).toBeTruthy();
  });

  it('createReorderRule gera active true por padrão', () => {
    const rule = factory.createReorderRule({
      tenantId: 'tenant-1',
      productId: 'product-1',
      thresholdQuantity: 10,
      reorderQuantity: 50,
    });

    expect(rule.active).toBe(true);
    expect(rule.ruleId).toBeTruthy();
    expect(rule.preferredSupplierId).toBeUndefined();
  });
});
