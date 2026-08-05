import { describe, expect, it } from 'vitest';
import { SupplierPerformanceService } from './SupplierPerformanceService';
import { FakeSupplierPerformanceRepository } from './testing/InMemoryFakes';

describe('SupplierPerformanceService', () => {
  it('record cria um único registro imutável via append (nunca update)', async () => {
    const service = new SupplierPerformanceService(new FakeSupplierPerformanceRepository());

    const record = await service.record({
      supplierId: 'supplier-1',
      tenantId: 'tenant-1',
      purchaseOrderId: 'po-1',
      observationType: 'OnTimeDelivery',
      observedAt: new Date('2026-01-01'),
    });

    expect(record.observationType).toBe('OnTimeDelivery');

    const history = await service.listBySupplier('supplier-1');
    expect(history).toHaveLength(1);
  });

  it('recordFromReceiving acumula histórico ao longo de múltiplos recebimentos', async () => {
    const service = new SupplierPerformanceService(new FakeSupplierPerformanceRepository());

    await service.recordFromReceiving({
      supplierId: 'supplier-1',
      tenantId: 'tenant-1',
      purchaseOrderId: 'po-1',
      promisedAt: new Date('2026-01-10'),
      receivedAt: new Date('2026-01-08'),
      quantityOrdered: 50,
      quantityReceived: 50,
    });

    await service.recordFromReceiving({
      supplierId: 'supplier-1',
      tenantId: 'tenant-1',
      purchaseOrderId: 'po-2',
      promisedAt: new Date('2026-02-10'),
      receivedAt: new Date('2026-02-20'),
      quantityOrdered: 30,
      quantityReceived: 25,
    });

    const history = await service.listBySupplier('supplier-1');
    expect(history).toHaveLength(4);
    expect(history.map((r) => r.observationType)).toEqual([
      'OnTimeDelivery',
      'QuantityMatch',
      'LateDelivery',
      'QuantityMismatch',
    ]);
  });
});
