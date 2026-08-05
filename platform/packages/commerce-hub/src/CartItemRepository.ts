import type { CartItem } from './CartItem';

/** Contrato de persistência de CartItem — apenas o contrato, per Etapa 7. Sem `update` — um item é removido e re-adicionado, nunca alterado in-place. */
export interface CartItemRepository {
  create(cartItem: CartItem): Promise<CartItem>;
  remove(cartItemId: string): Promise<void>;
  list(cartId: string): Promise<CartItem[]>;
}
