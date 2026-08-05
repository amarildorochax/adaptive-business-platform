import type { Subscription } from './Subscription';
import type { SubscriptionRepository } from './SubscriptionRepository';

/**
 * SubscriptionService — nenhum precedente legado foi encontrado. Gera cobrança, mas nunca processa
 * pagamento diretamente (Blueprint, Capítulo 12) — `renew` apenas estende a vigência ativa, nunca cria
 * Invoice/Payment (responsabilidade de FinanceManager, via `GenerateRecurringInvoice`). Nenhuma
 * emissão de Evento aqui.
 */
export class SubscriptionService {
  constructor(private readonly repository: SubscriptionRepository) {}

  async create(financialAccountId: string, amount: number, periodicityInDays: number): Promise<Subscription> {
    const subscription: Subscription = {
      subscriptionId: crypto.randomUUID(),
      financialAccountId,
      amount,
      periodicityInDays,
      active: true,
      createdAt: new Date(),
    };

    return this.repository.create(subscription);
  }

  async renew(subscriptionId: string): Promise<Subscription> {
    const existing = await this.repository.get(subscriptionId);

    if (!existing) {
      throw new Error(`Subscription ${subscriptionId} não encontrada.`);
    }

    if (!existing.active) {
      throw new Error(`Subscription ${subscriptionId} não está ativa — não pode ser renovada.`);
    }

    return this.repository.update({ ...existing });
  }

  async get(subscriptionId: string): Promise<Subscription | undefined> {
    return this.repository.get(subscriptionId);
  }

  async list(financialAccountId: string): Promise<readonly Subscription[]> {
    return this.repository.list(financialAccountId);
  }
}
