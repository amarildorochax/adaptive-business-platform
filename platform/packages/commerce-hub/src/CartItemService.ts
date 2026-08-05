import type { CartItem } from './CartItem';
import type { CartItemRepository } from './CartItemRepository';

/** CartItemService — nenhum precedente legado foi encontrado. Nenhuma emissão de Evento aqui — nenhum Evento aprovado cobre CartItem isoladamente (ver relatório desta Sprint). */
export class CartItemService {
  constructor(private readonly repository: CartItemRepository) {}

  async add(cartId: string, productId: string, quantity: number, unitPrice: number, variantId?: string): Promise<CartItem> {
    const cartItem: CartItem = {
      cartItemId: crypto.randomUUID(),
      cartId,
      productId,
      variantId,
      quantity,
      unitPrice,
      addedAt: new Date(),
    };

    return this.repository.create(cartItem);
  }

  async remove(cartItemId: string): Promise<void> {
    return this.repository.remove(cartItemId);
  }

  async list(cartId: string): Promise<readonly CartItem[]> {
    return this.repository.list(cartId);
  }
}
