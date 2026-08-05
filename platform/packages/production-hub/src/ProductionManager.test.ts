import { beforeEach, describe, expect, it } from 'vitest';
import { BillOfMaterialsService } from './BillOfMaterialsService';
import {
  BillOfMaterialsNotActiveError,
  BillOfMaterialsNotFoundError,
  InvalidWorkCenterNameError,
  ProductionConsumptionNotAllowedError,
  ProductionOrderHasConsumptionCannotCancelError,
  ProductionOrderHasNoOutputCannotCompleteError,
  ProductionOrderInvalidStatusTransitionError,
  ProductionOrderNotFoundError,
} from './ProductionDomainError';
import { ProductionExecutionService } from './ProductionExecutionService';
import { ProductionManager } from './ProductionManager';
import {
  FakeBillOfMaterialsRepository,
  FakeProductionOrderRepository,
  FakeWorkCenterRepository,
} from './testing/InMemoryFakes';
import { WorkCenterService } from './WorkCenterService';

function createManager() {
  const billOfMaterialsRepository = new FakeBillOfMaterialsRepository();
  const productionOrderRepository = new FakeProductionOrderRepository();
  const workCenterRepository = new FakeWorkCenterRepository();

  const manager = new ProductionManager({
    billsOfMaterials: new BillOfMaterialsService(billOfMaterialsRepository),
    execution: new ProductionExecutionService(productionOrderRepository, billOfMaterialsRepository),
    workCenters: new WorkCenterService(workCenterRepository),
  });

  return { manager, billOfMaterialsRepository, productionOrderRepository, workCenterRepository };
}

describe('ProductionManager', () => {
  let ctx: ReturnType<typeof createManager>;

  beforeEach(() => {
    ctx = createManager();
  });

  describe('createBillOfMaterials', () => {
    it('cria a primeira versão Active e publica BillOfMaterialsCreated', async () => {
      const { result, command, events } = await ctx.manager.createBillOfMaterials({
        tenantId: 'tenant-1',
        outputProductId: 'bread',
        lines: [{ inputProductId: 'flour', quantityPerOutputUnit: 2, unitOfMeasure: 'Kilogram' }],
      });

      expect(result.version).toBe(1);
      expect(result.status).toBe('Active');
      expect(command.type).toBe('CreateBillOfMaterials');
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('BillOfMaterialsCreated');
      expect(events[0].billOfMaterialsId).toBe(result.billOfMaterialsId);
    });
  });

  describe('supersedeBillOfMaterials', () => {
    it('marca a versão corrente como Superseded e cria a próxima como Active, publicando BillOfMaterialsSuperseded', async () => {
      const { result: bom } = await ctx.manager.createBillOfMaterials({
        tenantId: 'tenant-1',
        outputProductId: 'bread',
        lines: [{ inputProductId: 'flour', quantityPerOutputUnit: 2, unitOfMeasure: 'Kilogram' }],
      });

      const { result, command, events } = await ctx.manager.supersedeBillOfMaterials(bom.billOfMaterialsId, {
        lines: [{ inputProductId: 'flour', quantityPerOutputUnit: 3, unitOfMeasure: 'Kilogram' }],
      });

      expect(result.previous.status).toBe('Superseded');
      expect(result.previous.supersededAt).toBeInstanceOf(Date);
      expect(result.next.status).toBe('Active');
      expect(result.next.version).toBe(2);
      expect(command.type).toBe('SupersedeBillOfMaterials');
      expect(events).toEqual([
        expect.objectContaining({
          type: 'BillOfMaterialsSuperseded',
          billOfMaterialsId: result.next.billOfMaterialsId,
          previousBillOfMaterialsId: result.previous.billOfMaterialsId,
        }),
      ]);
    });

    it('rejeita superseder uma versão já Superseded — nunca origina nova versão de uma composição superada', async () => {
      const { result: bom } = await ctx.manager.createBillOfMaterials({
        tenantId: 'tenant-1',
        outputProductId: 'bread',
        lines: [],
      });
      await ctx.manager.supersedeBillOfMaterials(bom.billOfMaterialsId, { lines: [] });

      await expect(ctx.manager.supersedeBillOfMaterials(bom.billOfMaterialsId, { lines: [] })).rejects.toThrow(
        BillOfMaterialsNotActiveError,
      );
    });
  });

  describe('ciclo completo de ProductionOrder', () => {
    async function createActiveBOM() {
      const { result: bom } = await ctx.manager.createBillOfMaterials({
        tenantId: 'tenant-1',
        outputProductId: 'bread',
        lines: [{ inputProductId: 'flour', quantityPerOutputUnit: 2, unitOfMeasure: 'Kilogram' }],
      });
      return bom;
    }

    it('CreateProductionOrder não publica Evento — incompletude documentada, nunca inventado', async () => {
      const bom = await createActiveBOM();

      const { result, command, events } = await ctx.manager.createProductionOrder({
        tenantId: 'tenant-1',
        billOfMaterialsId: bom.billOfMaterialsId,
        plannedOutputQuantity: 10,
      });

      expect(result.status).toBe('Planned');
      expect(command.type).toBe('CreateProductionOrder');
      expect(events).toEqual([]);
    });

    it('CreateProductionOrder rejeita referenciar uma BillOfMaterials inexistente', async () => {
      await expect(
        ctx.manager.createProductionOrder({
          tenantId: 'tenant-1',
          billOfMaterialsId: 'does-not-exist',
          plannedOutputQuantity: 10,
        }),
      ).rejects.toThrow(BillOfMaterialsNotFoundError);
    });

    it('CreateProductionOrder rejeita referenciar uma BillOfMaterials Superseded', async () => {
      const bom = await createActiveBOM();
      await ctx.manager.supersedeBillOfMaterials(bom.billOfMaterialsId, { lines: [] });

      await expect(
        ctx.manager.createProductionOrder({
          tenantId: 'tenant-1',
          billOfMaterialsId: bom.billOfMaterialsId,
          plannedOutputQuantity: 10,
        }),
      ).rejects.toThrow(BillOfMaterialsNotActiveError);
    });

    it('StartProduction com insumo insuficiente permanece Planned, sem publicar ProductionStarted — nunca iniciada silenciosamente com déficit', async () => {
      const bom = await createActiveBOM();
      const { result: order } = await ctx.manager.createProductionOrder({
        tenantId: 'tenant-1',
        billOfMaterialsId: bom.billOfMaterialsId,
        plannedOutputQuantity: 10,
      });

      const { result, events } = await ctx.manager.startProduction(
        order.productionOrderId,
        new Map([['flour', 5]]),
      );

      expect(result.started).toBe(false);
      expect(result.productionOrder.status).toBe('Planned');
      expect(events).toEqual([]);
    });

    it('StartProduction com insumo suficiente transiciona a InProgress e publica ProductionStarted', async () => {
      const bom = await createActiveBOM();
      const { result: order } = await ctx.manager.createProductionOrder({
        tenantId: 'tenant-1',
        billOfMaterialsId: bom.billOfMaterialsId,
        plannedOutputQuantity: 10,
      });

      const { result, events } = await ctx.manager.startProduction(
        order.productionOrderId,
        new Map([['flour', 20]]),
      );

      expect(result.started).toBe(true);
      expect(result.productionOrder.status).toBe('InProgress');
      expect(result.productionOrder.startedAt).toBeInstanceOf(Date);
      expect(events).toEqual([
        expect.objectContaining({ type: 'ProductionStarted', productionOrderId: order.productionOrderId }),
      ]);
    });

    it('RegisterProductionConsumption antes de StartProduction é rejeitado', async () => {
      const bom = await createActiveBOM();
      const { result: order } = await ctx.manager.createProductionOrder({
        tenantId: 'tenant-1',
        billOfMaterialsId: bom.billOfMaterialsId,
        plannedOutputQuantity: 10,
      });

      await expect(
        ctx.manager.registerProductionConsumption(order.productionOrderId, {
          inputProductId: 'flour',
          quantityConsumed: 20,
          acquisitionCost: 40,
        }),
      ).rejects.toThrow(ProductionConsumptionNotAllowedError);
    });

    it('fluxo feliz completo: Start → RegisterConsumption → RegisterOutput → Complete', async () => {
      const bom = await createActiveBOM();
      const { result: created } = await ctx.manager.createProductionOrder({
        tenantId: 'tenant-1',
        billOfMaterialsId: bom.billOfMaterialsId,
        plannedOutputQuantity: 10,
      });

      const started = await ctx.manager.startProduction(created.productionOrderId, new Map([['flour', 20]]));
      expect(started.result.started).toBe(true);

      const consumption = await ctx.manager.registerProductionConsumption(created.productionOrderId, {
        inputProductId: 'flour',
        quantityConsumed: 20,
        acquisitionCost: 40,
      });
      expect(consumption.events).toEqual([
        expect.objectContaining({
          type: 'ProductionConsumption',
          productionOrderId: created.productionOrderId,
          inputProductId: 'flour',
        }),
      ]);

      const output = await ctx.manager.registerProductionOutput(created.productionOrderId, {
        outputProductId: 'bread',
        quantityGenerated: 9,
      });
      expect(output.events).toEqual([
        expect.objectContaining({
          type: 'ProductionOutput',
          productionOrderId: created.productionOrderId,
          outputProductId: 'bread',
        }),
      ]);
      expect(output.result.output.quantityGenerated).toBe(9);

      const completed = await ctx.manager.completeProduction(created.productionOrderId);
      expect(completed.result.status).toBe('Completed');
      expect(completed.result.completedAt).toBeInstanceOf(Date);
      expect(completed.events).toEqual([
        expect.objectContaining({ type: 'ProductionCompleted', productionOrderId: created.productionOrderId }),
      ]);

      expect(await ctx.manager.getTotalConsumedCost(created.productionOrderId)).toBe(40);
      expect(await ctx.manager.getTotalGeneratedQuantity(created.productionOrderId)).toBe(9);
    });

    it('CompleteProduction sem nenhum ProductionOutput registrado é rejeitado — nunca a ordem inversa', async () => {
      const bom = await createActiveBOM();
      const { result: created } = await ctx.manager.createProductionOrder({
        tenantId: 'tenant-1',
        billOfMaterialsId: bom.billOfMaterialsId,
        plannedOutputQuantity: 10,
      });
      await ctx.manager.startProduction(created.productionOrderId, new Map([['flour', 20]]));

      await expect(ctx.manager.completeProduction(created.productionOrderId)).rejects.toThrow(
        ProductionOrderHasNoOutputCannotCompleteError,
      );
    });

    it('CancelProduction antes de qualquer consumo é aceito e publica ProductionCancelled', async () => {
      const bom = await createActiveBOM();
      const { result: created } = await ctx.manager.createProductionOrder({
        tenantId: 'tenant-1',
        billOfMaterialsId: bom.billOfMaterialsId,
        plannedOutputQuantity: 10,
      });

      const { result, events } = await ctx.manager.cancelProduction(created.productionOrderId, 'Cliente desistiu do pedido');

      expect(result.status).toBe('Cancelled');
      expect(result.cancelReason).toBe('Cliente desistiu do pedido');
      expect(events).toEqual([
        expect.objectContaining({ type: 'ProductionCancelled', productionOrderId: created.productionOrderId }),
      ]);
    });

    it('CancelProduction após qualquer consumo já registrado é rejeitado — exige reversão explícita de estoque', async () => {
      const bom = await createActiveBOM();
      const { result: created } = await ctx.manager.createProductionOrder({
        tenantId: 'tenant-1',
        billOfMaterialsId: bom.billOfMaterialsId,
        plannedOutputQuantity: 10,
      });
      await ctx.manager.startProduction(created.productionOrderId, new Map([['flour', 20]]));
      await ctx.manager.registerProductionConsumption(created.productionOrderId, {
        inputProductId: 'flour',
        quantityConsumed: 20,
        acquisitionCost: 40,
      });

      await expect(ctx.manager.cancelProduction(created.productionOrderId, 'tarde demais')).rejects.toThrow(
        ProductionOrderHasConsumptionCannotCancelError,
      );
    });

    it('operações sobre ProductionOrder inexistente lançam ProductionOrderNotFoundError', async () => {
      await expect(ctx.manager.completeProduction('does-not-exist')).rejects.toThrow(ProductionOrderNotFoundError);
      await expect(ctx.manager.cancelProduction('does-not-exist', 'motivo')).rejects.toThrow(ProductionOrderNotFoundError);
    });

    it('CompleteProduction após já Completed é rejeitado pela máquina de estados', async () => {
      const bom = await createActiveBOM();
      const { result: created } = await ctx.manager.createProductionOrder({
        tenantId: 'tenant-1',
        billOfMaterialsId: bom.billOfMaterialsId,
        plannedOutputQuantity: 10,
      });
      await ctx.manager.startProduction(created.productionOrderId, new Map([['flour', 20]]));
      await ctx.manager.registerProductionOutput(created.productionOrderId, { outputProductId: 'bread', quantityGenerated: 9 });
      await ctx.manager.completeProduction(created.productionOrderId);

      await expect(ctx.manager.completeProduction(created.productionOrderId)).rejects.toThrow(
        ProductionOrderInvalidStatusTransitionError,
      );
    });

    it('listProductionOrdersByStatus e listProductionOrdersByOrigin filtram corretamente', async () => {
      const bom = await createActiveBOM();
      const { result: manual } = await ctx.manager.createProductionOrder({
        tenantId: 'tenant-1',
        billOfMaterialsId: bom.billOfMaterialsId,
        plannedOutputQuantity: 5,
      });
      const { result: reactive } = await ctx.manager.createProductionOrder({
        tenantId: 'tenant-1',
        billOfMaterialsId: bom.billOfMaterialsId,
        plannedOutputQuantity: 5,
        orderId: 'order-99',
      });

      const planned = await ctx.manager.listProductionOrdersByStatus('Planned');
      expect(planned.map((o) => o.productionOrderId).sort()).toEqual(
        [manual.productionOrderId, reactive.productionOrderId].sort(),
      );

      const byOrigin = await ctx.manager.listProductionOrdersByOrigin('order-99');
      expect(byOrigin).toEqual([reactive]);
    });
  });

  describe('createWorkCenter', () => {
    it('cria com active: true e não publica Evento — incompletude documentada, nunca inventado', async () => {
      const { result, command, events } = await ctx.manager.createWorkCenter({ tenantId: 'tenant-1', name: 'Linha 1' });

      expect(result.active).toBe(true);
      expect(command.type).toBe('CreateWorkCenter');
      expect(events).toEqual([]);
    });

    it('rejeita nome vazio', async () => {
      await expect(ctx.manager.createWorkCenter({ tenantId: 'tenant-1', name: '' })).rejects.toThrow(InvalidWorkCenterNameError);
    });

    it('listActiveWorkCenters retorna apenas Work Centers ativos', async () => {
      await ctx.manager.createWorkCenter({ tenantId: 'tenant-1', name: 'Linha 1' });
      await ctx.manager.createWorkCenter({ tenantId: 'tenant-1', name: 'Linha 2' });

      const active = await ctx.manager.listActiveWorkCenters();
      expect(active).toHaveLength(2);
    });
  });
});
