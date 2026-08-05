import { describe, expect, it } from 'vitest';
import { ProductionFactory } from './ProductionFactory';

describe('ProductionFactory', () => {
  const factory = new ProductionFactory();

  describe('createBillOfMaterials', () => {
    it('gera identificador, versão 1 e status Active por padrão', () => {
      const bom = factory.createBillOfMaterials({
        tenantId: 'tenant-1',
        outputProductId: 'bread',
        lines: [{ inputProductId: 'flour', quantityPerOutputUnit: 2, unitOfMeasure: 'Kilogram' }],
      });

      expect(bom.billOfMaterialsId).toBeTruthy();
      expect(bom.version).toBe(1);
      expect(bom.status).toBe('Active');
      expect(bom.supersededAt).toBeUndefined();
      expect(bom.createdAt).toBeInstanceOf(Date);
    });

    it('respeita a versão explícita informada — usado por BillOfMaterialsService.supersede', () => {
      const bom = factory.createBillOfMaterials({
        tenantId: 'tenant-1',
        outputProductId: 'bread',
        lines: [],
        version: 3,
      });

      expect(bom.version).toBe(3);
    });

    it('gera identificadores únicos entre chamadas', () => {
      const a = factory.createBillOfMaterials({ tenantId: 't', outputProductId: 'p', lines: [] });
      const b = factory.createBillOfMaterials({ tenantId: 't', outputProductId: 'p', lines: [] });
      expect(a.billOfMaterialsId).not.toBe(b.billOfMaterialsId);
    });
  });

  describe('createProductionOrder', () => {
    it('gera identificador, status Planned, consumptions/outputs vazios por padrão', () => {
      const order = factory.createProductionOrder({
        tenantId: 'tenant-1',
        billOfMaterialsId: 'bom-1',
        plannedOutputQuantity: 10,
      });

      expect(order.productionOrderId).toBeTruthy();
      expect(order.status).toBe('Planned');
      expect(order.consumptions).toEqual([]);
      expect(order.outputs).toEqual([]);
      expect(order.startedAt).toBeUndefined();
      expect(order.completedAt).toBeUndefined();
      expect(order.cancelReason).toBeUndefined();
    });

    it('preserva orderId e workCenterId opcionais quando informados', () => {
      const order = factory.createProductionOrder({
        tenantId: 'tenant-1',
        billOfMaterialsId: 'bom-1',
        plannedOutputQuantity: 10,
        orderId: 'order-1',
        workCenterId: 'wc-1',
      });

      expect(order.orderId).toBe('order-1');
      expect(order.workCenterId).toBe('wc-1');
    });

    it('omite orderId quando reabastecimento manual — nunca inventa um valor default', () => {
      const order = factory.createProductionOrder({
        tenantId: 'tenant-1',
        billOfMaterialsId: 'bom-1',
        plannedOutputQuantity: 10,
      });

      expect(order.orderId).toBeUndefined();
    });
  });

  describe('createProductionConsumption', () => {
    it('gera identificador e associa ao productionOrderId informado', () => {
      const consumption = factory.createProductionConsumption('po-1', {
        inputProductId: 'flour',
        quantityConsumed: 2,
        acquisitionCost: 5,
      });

      expect(consumption.consumptionId).toBeTruthy();
      expect(consumption.productionOrderId).toBe('po-1');
      expect(consumption.consumedAt).toBeInstanceOf(Date);
    });

    it('respeita consumedAt explícito quando informado', () => {
      const consumedAt = new Date('2026-01-01T00:00:00Z');
      const consumption = factory.createProductionConsumption('po-1', {
        inputProductId: 'flour',
        quantityConsumed: 2,
        acquisitionCost: 5,
        consumedAt,
      });

      expect(consumption.consumedAt).toBe(consumedAt);
    });
  });

  describe('createProductionOutput', () => {
    it('gera identificador e associa ao productionOrderId informado', () => {
      const output = factory.createProductionOutput('po-1', {
        outputProductId: 'bread',
        quantityGenerated: 8,
      });

      expect(output.outputId).toBeTruthy();
      expect(output.productionOrderId).toBe('po-1');
      expect(output.generatedAt).toBeInstanceOf(Date);
    });
  });

  describe('createWorkCenter', () => {
    it('gera identificador e active: true por padrão', () => {
      const workCenter = factory.createWorkCenter({ tenantId: 'tenant-1', name: 'Linha 1' });

      expect(workCenter.workCenterId).toBeTruthy();
      expect(workCenter.active).toBe(true);
      expect(workCenter.nominalCapacity).toBeUndefined();
    });
  });
});
