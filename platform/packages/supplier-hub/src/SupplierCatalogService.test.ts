import { describe, expect, it } from 'vitest';
import { SupplierCatalogService } from './SupplierCatalogService';
import { FakeSupplierCatalogItemRepository, FakeSupplierRepository } from './testing/InMemoryFakes';

function buildService() {
  return new SupplierCatalogService(new FakeSupplierCatalogItemRepository(), new FakeSupplierRepository());
}

describe('SupplierCatalogService', () => {
  it('listByProduct encontra itens de catálogo de múltiplos Fornecedores para o mesmo Produto', async () => {
    const service = buildService();

    await service.register({
      supplierId: 'supplier-1',
      tenantId: 'tenant-1',
      productId: 'product-1',
      listPrice: { amount: 10, currencyCode: 'BRL' },
      leadTimeInDays: 2,
      minimumOrderQuantity: 1,
    });
    await service.register({
      supplierId: 'supplier-2',
      tenantId: 'tenant-1',
      productId: 'product-1',
      listPrice: { amount: 12, currencyCode: 'BRL' },
      leadTimeInDays: 4,
      minimumOrderQuantity: 5,
    });

    const items = await service.listByProduct('product-1');

    expect(items).toHaveLength(2);
    expect(items.map((i) => i.supplierId).sort()).toEqual(['supplier-1', 'supplier-2']);
  });

  it('update lança SupplierCatalogItemNotFoundError para item inexistente', async () => {
    const service = buildService();

    await expect(
      service.update('item-inexistente', { leadTimeInDays: 1 }),
    ).rejects.toThrow(/não encontrado/);
  });
});
