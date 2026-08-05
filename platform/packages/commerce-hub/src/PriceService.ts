import type { Price } from './Price';
import type { PriceRepository } from './PriceRepository';

/** Campos aceitos por `PriceService.create()`. */
export type SetPriceInput = Pick<Price, 'productId' | 'variantId' | 'amount' | 'currency'>;

/** PriceService — nenhum precedente legado foi encontrado. Nenhuma emissão de Evento aqui — responsabilidade exclusiva de CommerceManager (`PriceChanged`). */
export class PriceService {
  constructor(private readonly repository: PriceRepository) {}

  async set(input: SetPriceInput): Promise<Price> {
    const existing = await this.repository.findCurrent(input.productId, input.variantId);

    if (existing) {
      return this.repository.update({ ...existing, amount: input.amount, currency: input.currency });
    }

    const price: Price = { priceId: crypto.randomUUID(), createdAt: new Date(), ...input };
    return this.repository.create(price);
  }

  async findCurrent(productId: string, variantId?: string): Promise<Price | undefined> {
    return this.repository.findCurrent(productId, variantId);
  }
}
