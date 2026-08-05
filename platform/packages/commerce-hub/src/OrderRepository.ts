import type { Order } from './Order';

/** Contrato de persistência de Order — apenas o contrato, per Etapa 7. Sem `remove` — Soft Delete via `status: 'Cancelled'`, histórico preservado integralmente (Capítulo 33). */
export interface OrderRepository {
  create(order: Order): Promise<Order>;
  update(order: Order): Promise<Order>;
  get(orderId: string): Promise<Order | undefined>;
  list(tenantId: string): Promise<Order[]>;
}
