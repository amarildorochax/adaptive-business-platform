import type { OrderItem } from './OrderItem';
import type { OrderItemRepository } from './OrderItemRepository';

/** OrderItemService — nenhum precedente legado foi encontrado. Nenhuma emissão de Evento aqui — nenhum Evento aprovado cobre OrderItem isoladamente. */
export class OrderItemService {
  constructor(private readonly repository: OrderItemRepository) {}

  async add(orderId: string, productId: string, quantity: number, unitPrice: number, variantId?: string): Promise<OrderItem> {
    const orderItem: OrderItem = {
      orderItemId: crypto.randomUUID(),
      orderId,
      productId,
      variantId,
      quantity,
      unitPrice,
    };

    return this.repository.create(orderItem);
  }

  async list(orderId: string): Promise<readonly OrderItem[]> {
    return this.repository.list(orderId);
  }
}
