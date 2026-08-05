import type { Subscription } from './Subscription';

/** Contrato de persistência de Subscription — apenas o contrato, per Etapa 7. */
export interface SubscriptionRepository {
  create(subscription: Subscription): Promise<Subscription>;
  update(subscription: Subscription): Promise<Subscription>;
  get(subscriptionId: string): Promise<Subscription | undefined>;
  list(financialAccountId: string): Promise<Subscription[]>;
}
