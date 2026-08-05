import type { OrderItem } from './OrderItem';

/** Contrato de persistência de OrderItem — apenas o contrato, per Etapa 7. Sem `update`/`remove` — confirmado no Checkout, imutável a partir da criação do Order. */
export interface OrderItemRepository {
  create(orderItem: OrderItem): Promise<OrderItem>;
  list(orderId: string): Promise<OrderItem[]>;
}
