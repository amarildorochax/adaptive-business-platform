import { describe, expect, it } from 'vitest';
import { ProductService } from './ProductService';
import { FakeProductRepository } from './testing/InMemoryFakes';

describe('ProductService', () => {
  it('cria um Product sempre no estado Draft', async () => {
    const service = new ProductService(new FakeProductRepository());

    const product = await service.create({
      tenantId: 'tenant-1',
      catalogId: 'catalog-1',
      categoryId: undefined,
      name: 'Buquê de Rosas',
      description: undefined,
    });

    expect(product.status).toBe('Draft');
  });

  it('publish transiciona para Published', async () => {
    const service = new ProductService(new FakeProductRepository());
    const created = await service.create({
      tenantId: 'tenant-1',
      catalogId: 'catalog-1',
      categoryId: undefined,
      name: 'Produto',
      description: undefined,
    });

    const published = await service.publish(created.productId);

    expect(published.status).toBe('Published');
  });

  it('discontinue nunca remove fisicamente — apenas transiciona o status (Soft Delete)', async () => {
    const service = new ProductService(new FakeProductRepository());
    const created = await service.create({
      tenantId: 'tenant-1',
      catalogId: 'catalog-1',
      categoryId: undefined,
      name: 'Produto',
      description: undefined,
    });

    const discontinued = await service.discontinue(created.productId);

    expect(discontinued.status).toBe('Discontinued');
    expect(await service.get(created.productId)).toBeDefined();
  });
});
