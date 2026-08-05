import type { Delivery, DeliveryStatus } from './Delivery';
import type { DeliveryRepository } from './DeliveryRepository';

/**
 * DeliveryService — registro de tentativa de entrega de uma Message, mantido deliberadamente
 * separado da Message em si (regra `DeliveryNeverAltersMessage`, já catalogada em
 * `CommBusinessRule.ts`). Cada chamada — seja a primeira tentativa, seja uma nova tentativa via
 * `RetryDelivery` — cria um novo registro, nunca atualiza um existente (`RetryNeverAltersHistory`).
 *
 * Inexistente em `src/core` ou `src/app` (IMP-003, Etapa 1); construído diretamente sobre o
 * contrato já existente.
 */
export class DeliveryService {
  constructor(private readonly repository: DeliveryRepository) {}

  async recordAttempt(messageId: string, status: DeliveryStatus): Promise<Delivery> {
    const delivery: Delivery = {
      deliveryId: crypto.randomUUID(),
      messageId,
      status,
      attemptedAt: new Date(),
    };

    return this.repository.create(delivery);
  }

  async listByMessage(messageId: string): Promise<readonly Delivery[]> {
    return this.repository.listByMessage(messageId);
  }
}
