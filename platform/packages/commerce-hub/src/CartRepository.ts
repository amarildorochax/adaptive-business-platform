import type { Cart } from './Cart';

/** Contrato de persistência de Cart — apenas o contrato, per Etapa 7. */
export interface CartRepository {
  create(cart: Cart): Promise<Cart>;
  update(cart: Cart): Promise<Cart>;
  get(cartId: string): Promise<Cart | undefined>;
  list(tenantId: string): Promise<Cart[]>;
}
