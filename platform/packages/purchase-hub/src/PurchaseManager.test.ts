import { describe, expect, it } from 'vitest';
import { PurchaseManager } from './PurchaseManager';
import { PurchaseOrderService } from './PurchaseOrderService';
import { PurchaseRequisitionService } from './PurchaseRequisitionService';
import { ReceivingService } from './ReceivingService';
import { ReorderEvaluationService } from './ReorderEvaluationService';
import {
  FakePurchaseOrderRepository,
  FakePurchaseRequisitionRepository,
  FakeReceivingRepository,
  FakeReorderRuleRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  const purchaseOrderRepository = new FakePurchaseOrderRepository();
  const requisitionRepository = new FakePurchaseRequisitionRepository();

  return new PurchaseManager({
    orders: new PurchaseOrderService(purchaseOrderRepository),
    receiving: new ReceivingService(new FakeReceivingRepository(), purchaseOrderRepository),
    requisitions: new PurchaseRequisitionService(requisitionRepository, purchaseOrderRepository),
    reorder: new ReorderEvaluationService(new FakeReorderRuleRepository(), requisitionRepository),
  });
}

describe('PurchaseManager — Purchase Hub Core (IMP-301)', () => {
  it('createPurchaseOrder produz Purchase Order Draft e o Event PurchaseCreated, com Command CreatePurchaseOrder', async () => {
    const manager = buildManager();

    const { result, command, events } = await manager.createPurchaseOrder({
      tenantId: 'tenant-1',
      supplierId: 'supplier-1',
    });

    expect(result.status).toBe('Draft');
    expect(result.items).toEqual([]);
    expect(command.type).toBe('CreatePurchaseOrder');
    expect(events.map((e) => e.type)).toEqual(['PurchaseCreated']);
  });

  it('addPurchaseOrderItem transiciona Draft → PendingApproval no primeiro item, sem publicar Evento — incompletude documentada', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseOrder({ tenantId: 'tenant-1', supplierId: 'supplier-1' });

    const { result, command, events } = await manager.addPurchaseOrderItem(created.purchaseOrderId, {
      productId: 'product-1',
      quantityOrdered: 10,
      acquisitionCost: { amount: 10, currencyCode: 'BRL' },
    });

    expect(result.status).toBe('PendingApproval');
    expect(result.items).toHaveLength(1);
    expect(command.type).toBe('AddPurchaseOrderItem');
    expect(events).toEqual([]);
  });

  it('addPurchaseOrderItem rejeita item após o Purchase Order sair da fase de montagem', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseOrder({ tenantId: 'tenant-1', supplierId: 'supplier-1' });
    await manager.addPurchaseOrderItem(created.purchaseOrderId, {
      productId: 'product-1',
      quantityOrdered: 10,
      acquisitionCost: { amount: 10, currencyCode: 'BRL' },
    });
    await manager.approvePurchaseOrder(created.purchaseOrderId, { limit: { amount: 1000, currencyCode: 'BRL' } });
    await manager.sendPurchaseOrderToSupplier(created.purchaseOrderId);

    await expect(
      manager.addPurchaseOrderItem(created.purchaseOrderId, {
        productId: 'product-2',
        quantityOrdered: 1,
        acquisitionCost: { amount: 1, currencyCode: 'BRL' },
      }),
    ).rejects.toThrow(/não aceita novos itens/);
  });

  it('approvePurchaseOrder aprova diretamente quando o total está dentro do threshold, sem identidade', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseOrder({ tenantId: 'tenant-1', supplierId: 'supplier-1' });
    await manager.addPurchaseOrderItem(created.purchaseOrderId, {
      productId: 'product-1',
      quantityOrdered: 10,
      acquisitionCost: { amount: 10, currencyCode: 'BRL' },
    });

    const { result, events } = await manager.approvePurchaseOrder(created.purchaseOrderId, {
      limit: { amount: 200, currencyCode: 'BRL' },
    });

    expect(result.status).toBe('Approved');
    expect(events.map((e) => e.type)).toEqual(['PurchaseApproved']);
  });

  it('approvePurchaseOrder rejeita quando o total excede o threshold e nenhuma identidade é informada', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseOrder({ tenantId: 'tenant-1', supplierId: 'supplier-1' });
    await manager.addPurchaseOrderItem(created.purchaseOrderId, {
      productId: 'product-1',
      quantityOrdered: 10,
      acquisitionCost: { amount: 10, currencyCode: 'BRL' },
    });

    await expect(
      manager.approvePurchaseOrder(created.purchaseOrderId, { limit: { amount: 50, currencyCode: 'BRL' } }),
    ).rejects.toThrow(/requer uma identidade de aprovação explícita/);
  });

  it('approvePurchaseOrder aprova acima do threshold quando uma identidade explícita é informada', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseOrder({ tenantId: 'tenant-1', supplierId: 'supplier-1' });
    await manager.addPurchaseOrderItem(created.purchaseOrderId, {
      productId: 'product-1',
      quantityOrdered: 10,
      acquisitionCost: { amount: 10, currencyCode: 'BRL' },
    });

    const { result } = await manager.approvePurchaseOrder(
      created.purchaseOrderId,
      { limit: { amount: 50, currencyCode: 'BRL' } },
      'identity-1',
    );

    expect(result.status).toBe('Approved');
    expect(result.approvedByIdentityId).toBe('identity-1');
  });

  it('sendPurchaseOrderToSupplier transiciona para Sent e emite PurchaseSentToSupplier', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseOrder({ tenantId: 'tenant-1', supplierId: 'supplier-1' });
    await manager.addPurchaseOrderItem(created.purchaseOrderId, {
      productId: 'product-1',
      quantityOrdered: 10,
      acquisitionCost: { amount: 10, currencyCode: 'BRL' },
    });
    await manager.approvePurchaseOrder(created.purchaseOrderId, { limit: { amount: 1000, currencyCode: 'BRL' } });

    const { result, events } = await manager.sendPurchaseOrderToSupplier(created.purchaseOrderId);

    expect(result.status).toBe('Sent');
    expect(events.map((e) => e.type)).toEqual(['PurchaseSentToSupplier']);
  });

  it('registerReceiving parcial mantém PartiallyReceived e emite PurchasePartiallyReceived', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseOrder({ tenantId: 'tenant-1', supplierId: 'supplier-1' });
    const { result: withItem } = await manager.addPurchaseOrderItem(created.purchaseOrderId, {
      productId: 'product-1',
      quantityOrdered: 10,
      acquisitionCost: { amount: 10, currencyCode: 'BRL' },
    });
    await manager.approvePurchaseOrder(created.purchaseOrderId, { limit: { amount: 1000, currencyCode: 'BRL' } });
    await manager.sendPurchaseOrderToSupplier(created.purchaseOrderId);
    const itemId = withItem.items[0]!.purchaseOrderItemId;

    const { result, events } = await manager.registerReceiving({
      purchaseOrderId: created.purchaseOrderId,
      tenantId: 'tenant-1',
      lines: [{ purchaseOrderItemId: itemId, quantityReceived: 4 }],
      receivedAt: new Date('2026-02-01'),
    });

    expect(result.purchaseOrder.status).toBe('PartiallyReceived');
    expect(result.fullyReceived).toBe(false);
    expect(events.map((e) => e.type)).toEqual(['PurchasePartiallyReceived']);
  });

  it('registerReceiving completo transiciona para Received e emite PurchaseReceived', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseOrder({ tenantId: 'tenant-1', supplierId: 'supplier-1' });
    const { result: withItem } = await manager.addPurchaseOrderItem(created.purchaseOrderId, {
      productId: 'product-1',
      quantityOrdered: 10,
      acquisitionCost: { amount: 10, currencyCode: 'BRL' },
    });
    await manager.approvePurchaseOrder(created.purchaseOrderId, { limit: { amount: 1000, currencyCode: 'BRL' } });
    await manager.sendPurchaseOrderToSupplier(created.purchaseOrderId);
    const itemId = withItem.items[0]!.purchaseOrderItemId;

    const { result, events } = await manager.registerReceiving({
      purchaseOrderId: created.purchaseOrderId,
      tenantId: 'tenant-1',
      lines: [{ purchaseOrderItemId: itemId, quantityReceived: 10 }],
      receivedAt: new Date('2026-02-01'),
    });

    expect(result.purchaseOrder.status).toBe('Received');
    expect(result.fullyReceived).toBe(true);
    expect(events.map((e) => e.type)).toEqual(['PurchaseReceived']);
  });

  it('registerReceiving rejeita quantidade acima da pendente do item', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseOrder({ tenantId: 'tenant-1', supplierId: 'supplier-1' });
    const { result: withItem } = await manager.addPurchaseOrderItem(created.purchaseOrderId, {
      productId: 'product-1',
      quantityOrdered: 10,
      acquisitionCost: { amount: 10, currencyCode: 'BRL' },
    });
    await manager.approvePurchaseOrder(created.purchaseOrderId, { limit: { amount: 1000, currencyCode: 'BRL' } });
    await manager.sendPurchaseOrderToSupplier(created.purchaseOrderId);
    const itemId = withItem.items[0]!.purchaseOrderItemId;

    await expect(
      manager.registerReceiving({
        purchaseOrderId: created.purchaseOrderId,
        tenantId: 'tenant-1',
        lines: [{ purchaseOrderItemId: itemId, quantityReceived: 11 }],
        receivedAt: new Date('2026-02-01'),
      }),
    ).rejects.toThrow(/excede a quantidade ainda pendente/);
  });

  it('cancelPurchaseOrder a partir de Draft transiciona para Cancelled e emite PurchaseCancelled', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseOrder({ tenantId: 'tenant-1', supplierId: 'supplier-1' });

    const { result, events } = await manager.cancelPurchaseOrder(created.purchaseOrderId);

    expect(result.status).toBe('Cancelled');
    expect(events.map((e) => e.type)).toEqual(['PurchaseCancelled']);
  });

  it('cancelPurchaseOrder é rejeitado após qualquer Receiving já registrado', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseOrder({ tenantId: 'tenant-1', supplierId: 'supplier-1' });
    const { result: withItem } = await manager.addPurchaseOrderItem(created.purchaseOrderId, {
      productId: 'product-1',
      quantityOrdered: 10,
      acquisitionCost: { amount: 10, currencyCode: 'BRL' },
    });
    await manager.approvePurchaseOrder(created.purchaseOrderId, { limit: { amount: 1000, currencyCode: 'BRL' } });
    await manager.sendPurchaseOrderToSupplier(created.purchaseOrderId);
    const itemId = withItem.items[0]!.purchaseOrderItemId;
    await manager.registerReceiving({
      purchaseOrderId: created.purchaseOrderId,
      tenantId: 'tenant-1',
      lines: [{ purchaseOrderItemId: itemId, quantityReceived: 4 }],
      receivedAt: new Date('2026-02-01'),
    });

    await expect(manager.cancelPurchaseOrder(created.purchaseOrderId)).rejects.toThrow(
      /já possui Receiving registrado/,
    );
  });

  it('createPurchaseRequisition produz Requisition Open e emite PurchaseRequisitionCreated', async () => {
    const manager = buildManager();

    const { result, events } = await manager.createPurchaseRequisition({
      tenantId: 'tenant-1',
      origin: 'Manual',
      lines: [{ productId: 'product-1', suggestedQuantity: 30 }],
    });

    expect(result.status).toBe('Open');
    expect(events.map((e) => e.type)).toEqual(['PurchaseRequisitionCreated']);
  });

  it('approvePurchaseRequisition transiciona para Approved e emite PurchaseRequisitionApproved', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseRequisition({
      tenantId: 'tenant-1',
      origin: 'Manual',
      lines: [{ productId: 'product-1', suggestedQuantity: 30 }],
    });

    const { result, events } = await manager.approvePurchaseRequisition(created.requisitionId);

    expect(result.status).toBe('Approved');
    expect(events.map((e) => e.type)).toEqual(['PurchaseRequisitionApproved']);
  });

  it('rejectPurchaseRequisition transiciona para Rejected sem publicar Evento — incompletude documentada', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseRequisition({
      tenantId: 'tenant-1',
      origin: 'Manual',
      lines: [{ productId: 'product-1', suggestedQuantity: 30 }],
    });

    const { result, command, events } = await manager.rejectPurchaseRequisition(created.requisitionId);

    expect(result.status).toBe('Rejected');
    expect(command.type).toBe('RejectPurchaseRequisition');
    expect(events).toEqual([]);
  });

  it('convertRequisitionToPurchaseOrder cria Purchase Order PendingApproval com os custos negociados', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseRequisition({
      tenantId: 'tenant-1',
      origin: 'Manual',
      lines: [{ productId: 'product-1', suggestedQuantity: 30 }],
    });
    await manager.approvePurchaseRequisition(created.requisitionId);

    const { result, events } = await manager.convertRequisitionToPurchaseOrder(
      created.requisitionId,
      'supplier-1',
      new Map([['product-1', { amount: 20, currencyCode: 'BRL' }]]),
    );

    expect(result.requisition.status).toBe('ConvertedToPurchaseOrder');
    expect(result.purchaseOrder.status).toBe('PendingApproval');
    expect(result.purchaseOrder.items).toHaveLength(1);
    expect(result.purchaseOrder.items[0]?.acquisitionCost.amount).toBe(20);
    expect(events.map((e) => e.type)).toEqual(['PurchaseCreated']);
  });

  it('convertRequisitionToPurchaseOrder rejeita quando falta custo de aquisição para algum Produto', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseRequisition({
      tenantId: 'tenant-1',
      origin: 'Manual',
      lines: [{ productId: 'product-1', suggestedQuantity: 30 }],
    });
    await manager.approvePurchaseRequisition(created.requisitionId);

    await expect(
      manager.convertRequisitionToPurchaseOrder(created.requisitionId, 'supplier-1', new Map()),
    ).rejects.toThrow(/Nenhum custo de aquisição foi informado/);
  });

  it('convertRequisitionToPurchaseOrder rejeita Requisition ainda não aprovada', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseRequisition({
      tenantId: 'tenant-1',
      origin: 'Manual',
      lines: [{ productId: 'product-1', suggestedQuantity: 30 }],
    });

    await expect(
      manager.convertRequisitionToPurchaseOrder(
        created.requisitionId,
        'supplier-1',
        new Map([['product-1', { amount: 20, currencyCode: 'BRL' }]]),
      ),
    ).rejects.toThrow(/não está aprovada/);
  });

  it('createReorderRule produz Regra ativa sem publicar Evento — incompletude documentada', async () => {
    const manager = buildManager();

    const { result, command, events } = await manager.createReorderRule({
      tenantId: 'tenant-1',
      productId: 'product-1',
      thresholdQuantity: 10,
      reorderQuantity: 50,
    });

    expect(result.active).toBe(true);
    expect(command.type).toBe('CreateReorderRule');
    expect(events).toEqual([]);
  });

  it('deactivateReorderRule desativa a Regra sem publicar Evento — incompletude documentada', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createReorderRule({
      tenantId: 'tenant-1',
      productId: 'product-1',
      thresholdQuantity: 10,
      reorderQuantity: 50,
    });

    const { result, events } = await manager.deactivateReorderRule(created.ruleId);

    expect(result.active).toBe(false);
    expect(events).toEqual([]);
  });

  it('evaluateReorderRule dispara e produz ReorderRuleTriggered + PurchaseRequisitionCreated quando a quantidade está no threshold', async () => {
    const manager = buildManager();
    const { result: rule } = await manager.createReorderRule({
      tenantId: 'tenant-1',
      productId: 'product-1',
      thresholdQuantity: 10,
      reorderQuantity: 50,
    });

    const { result, events } = await manager.evaluateReorderRule(rule.ruleId, 5);

    expect(result.triggered).toBe(true);
    expect(result.requisition?.origin).toBe('ReorderRule');
    expect(result.requisition?.lines).toEqual([{ productId: 'product-1', suggestedQuantity: 50 }]);
    expect(events.map((e) => e.type)).toEqual(['ReorderRuleTriggered', 'PurchaseRequisitionCreated']);
  });

  it('evaluateReorderRule não é um Command — o resultado nunca carrega um PurchaseCommand', async () => {
    const manager = buildManager();
    const { result: rule } = await manager.createReorderRule({
      tenantId: 'tenant-1',
      productId: 'product-1',
      thresholdQuantity: 10,
      reorderQuantity: 50,
    });

    const evaluation = await manager.evaluateReorderRule(rule.ruleId, 5);

    expect('command' in evaluation).toBe(false);
  });

  it('evaluateReorderRule não dispara e não publica Evento quando acima do threshold', async () => {
    const manager = buildManager();
    const { result: rule } = await manager.createReorderRule({
      tenantId: 'tenant-1',
      productId: 'product-1',
      thresholdQuantity: 10,
      reorderQuantity: 50,
    });

    const { result, events } = await manager.evaluateReorderRule(rule.ruleId, 20);

    expect(result.triggered).toBe(false);
    expect(result.requisition).toBeUndefined();
    expect(events).toEqual([]);
  });

  it('getPurchaseOrder, listOpenPurchaseOrders e listPurchaseOrdersBySupplier refletem o estado real', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseOrder({ tenantId: 'tenant-1', supplierId: 'supplier-1' });

    const fetched = await manager.getPurchaseOrder(created.purchaseOrderId);
    const open = await manager.listOpenPurchaseOrders('tenant-1');
    const bySupplier = await manager.listPurchaseOrdersBySupplier('supplier-1');

    expect(fetched?.purchaseOrderId).toBe(created.purchaseOrderId);
    expect(open).toHaveLength(1);
    expect(bySupplier).toHaveLength(1);

    await manager.cancelPurchaseOrder(created.purchaseOrderId);
    expect(await manager.listOpenPurchaseOrders('tenant-1')).toHaveLength(0);
  });

  it('getPurchaseRequisition e listPurchaseRequisitionsByStatus refletem o estado real', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseRequisition({
      tenantId: 'tenant-1',
      origin: 'Manual',
      lines: [{ productId: 'product-1', suggestedQuantity: 30 }],
    });

    const fetched = await manager.getPurchaseRequisition(created.requisitionId);
    const open = await manager.listPurchaseRequisitionsByStatus('tenant-1', 'Open');

    expect(fetched?.requisitionId).toBe(created.requisitionId);
    expect(open).toHaveLength(1);
  });

  it('listReceivingsByPurchaseOrder reflete cada Receiving registrado, em ordem', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPurchaseOrder({ tenantId: 'tenant-1', supplierId: 'supplier-1' });
    const { result: withItem } = await manager.addPurchaseOrderItem(created.purchaseOrderId, {
      productId: 'product-1',
      quantityOrdered: 10,
      acquisitionCost: { amount: 10, currencyCode: 'BRL' },
    });
    await manager.approvePurchaseOrder(created.purchaseOrderId, { limit: { amount: 1000, currencyCode: 'BRL' } });
    await manager.sendPurchaseOrderToSupplier(created.purchaseOrderId);
    const itemId = withItem.items[0]!.purchaseOrderItemId;
    await manager.registerReceiving({
      purchaseOrderId: created.purchaseOrderId,
      tenantId: 'tenant-1',
      lines: [{ purchaseOrderItemId: itemId, quantityReceived: 10 }],
      receivedAt: new Date('2026-02-01'),
    });

    const receivings = await manager.listReceivingsByPurchaseOrder(created.purchaseOrderId);
    expect(receivings).toHaveLength(1);
  });

  it('operações sobre um Purchase Order inexistente lançam PurchaseOrderNotFoundError', async () => {
    const manager = buildManager();

    await expect(manager.cancelPurchaseOrder('po-inexistente')).rejects.toThrow(/não encontrado/);
  });

  it('operações sobre uma Purchase Requisition inexistente lançam PurchaseRequisitionNotFoundError', async () => {
    const manager = buildManager();

    await expect(manager.approvePurchaseRequisition('req-inexistente')).rejects.toThrow(/não encontrada/);
  });

  it('evaluateReorderRule sobre uma Reorder Rule inexistente lança ReorderRuleNotFoundError', async () => {
    const manager = buildManager();

    await expect(manager.evaluateReorderRule('rule-inexistente', 1)).rejects.toThrow(/não encontrada/);
  });
});
