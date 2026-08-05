import { describe, expect, it } from 'vitest';
import { PriceService } from './PriceService';
import { FakePriceRepository } from './testing/InMemoryFakes';

describe('PriceService', () => {
  it('set cria um novo Price na primeira chamada', async () => {
    const service = new PriceService(new FakePriceRepository());

    const price = await service.set({ productId: 'product-1', variantId: undefined, amount: 99.9, currency: 'BRL' });

    expect(price.amount).toBe(99.9);
  });

  it('set atualiza o Price existente nas chamadas seguintes — nunca duplica', async () => {
    const service = new PriceService(new FakePriceRepository());

    const first = await service.set({ productId: 'product-1', variantId: undefined, amount: 99.9, currency: 'BRL' });
    const second = await service.set({ productId: 'product-1', variantId: undefined, amount: 79.9, currency: 'BRL' });

    expect(second.priceId).toBe(first.priceId);
    expect(second.amount).toBe(79.9);
  });
});
