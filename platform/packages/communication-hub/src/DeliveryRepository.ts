import type { Delivery } from './Delivery';

/**
 * DeliveryRepository — contrato de persistência de Delivery. Interface apenas, per IMP-003,
 * Etapa 7. Deliberadamente sem `update` — cada tentativa de entrega, incluindo uma nova tentativa
 * (`RetryDelivery`), é um novo registro imutável, nunca uma reescrita de tentativa anterior
 * (regra de negócio `RetryNeverAltersHistory`, já catalogada em `CommBusinessRule.ts`).
 */
export interface DeliveryRepository {
  create(delivery: Delivery): Promise<Delivery>;
  listByMessage(messageId: string): Promise<readonly Delivery[]>;
}
