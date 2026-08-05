import type { Cart } from './Cart';
import type { CartRepository } from './CartRepository';

/**
 * CartService — nenhum precedente legado foi encontrado. Nenhuma emissão de Evento aqui —
 * responsabilidade exclusiva de CommerceManager (`CartCreated`/`CartAbandoned`).
 */
export class CartService {
  constructor(private readonly repository: CartRepository) {}

  async create(tenantId: string, customerReferenceId?: string): Promise<Cart> {
    const now = new Date();
    const cart: Cart = {
      cartId: crypto.randomUUID(),
      tenantId,
      customerReferenceId,
      status: 'Active',
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.create(cart);
  }

  async abandon(cartId: string): Promise<Cart> {
    const existing = await this.repository.get(cartId);

    if (!existing) {
      throw new Error(`Cart ${cartId} não encontrado.`);
    }

    return this.repository.update({ ...existing, status: 'Abandoned', updatedAt: new Date() });
  }

  async checkOut(cartId: string): Promise<Cart> {
    const existing = await this.repository.get(cartId);

    if (!existing) {
      throw new Error(`Cart ${cartId} não encontrado.`);
    }

    return this.repository.update({ ...existing, status: 'CheckedOut', updatedAt: new Date() });
  }

  async get(cartId: string): Promise<Cart | undefined> {
    return this.repository.get(cartId);
  }
}
