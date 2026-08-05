import type { Price } from './Price';

/**
 * Contrato de persistência de Price — apenas o contrato, per Etapa 7. `update` existe porque
 * `PriceChanged` (Evento aprovado) representa uma alteração de preço já existente, não apenas a
 * criação de um novo Price.
 */
export interface PriceRepository {
  create(price: Price): Promise<Price>;
  update(price: Price): Promise<Price>;
  get(priceId: string): Promise<Price | undefined>;
  findCurrent(productId: string, variantId?: string): Promise<Price | undefined>;
}
