import { describe, expect, it } from 'vitest';
import { SupplierContractService } from './SupplierContractService';
import { FakeSupplierContractRepository } from './testing/InMemoryFakes';

describe('SupplierContractService', () => {
  it('listBySupplier retorna apenas os contratos do Supplier informado', async () => {
    const service = new SupplierContractService(new FakeSupplierContractRepository());

    await service.create({
      supplierId: 'supplier-1',
      tenantId: 'tenant-1',
      startsAt: new Date('2026-01-01'),
      paymentTerms: { dueInDays: 30 },
    });
    await service.create({
      supplierId: 'supplier-2',
      tenantId: 'tenant-1',
      startsAt: new Date('2026-01-01'),
      paymentTerms: { dueInDays: 60 },
    });

    const contracts = await service.listBySupplier('supplier-1');

    expect(contracts).toHaveLength(1);
    expect(contracts[0]?.supplierId).toBe('supplier-1');
  });
});
