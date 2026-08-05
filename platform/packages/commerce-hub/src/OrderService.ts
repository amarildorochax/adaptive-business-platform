import type { Order } from './Order';
import type { OrderRepository } from './OrderRepository';

/** OrderService — nenhum precedente legado foi encontrado (ver relatório desta Sprint). Nenhuma emissão de Evento aqui — responsabilidade exclusiva de CommerceManager. */
export class OrderService {
  constructor(private readonly repository: OrderRepository) {}

  async create(tenantId: string, cartId?: string, customerReferenceId?: string): Promise<Order> {
    const now = new Date();
    const order: Order = {
      orderId: crypto.randomUUID(),
      tenantId,
      cartId,
      customerReferenceId,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.create(order);
  }

  async markPaid(orderId: string): Promise<Order> {
    return this.transition(orderId, 'Paid');
  }

  async fulfill(orderId: string): Promise<Order> {
    return this.transition(orderId, 'Fulfilling');
  }

  async cancel(orderId: string): Promise<Order> {
    return this.transition(orderId, 'Cancelled');
  }

  async get(orderId: string): Promise<Order | undefined> {
    return this.repository.get(orderId);
  }

  async list(tenantId: string): Promise<readonly Order[]> {
    return this.repository.list(tenantId);
  }

  private async transition(orderId: string, status: Order['status']): Promise<Order> {
    const existing = await this.repository.get(orderId);

    if (!existing) {
      throw new Error(`Order ${orderId} não encontrado.`);
    }

    return this.repository.update({ ...existing, status, updatedAt: new Date() });
  }
}
