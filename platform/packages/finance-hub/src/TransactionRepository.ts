import type { Transaction } from './Transaction';

/** Contrato de persistência de Transaction — apenas o contrato, per Etapa 7. Sem `update`/`remove` — Immutable Transactions (`FINANCE_HUB.md`, Capítulo 5): qualquer correção produz uma nova Transaction, nunca uma edição da existente. */
export interface TransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  get(transactionId: string): Promise<Transaction | undefined>;
  list(tenantId: string): Promise<Transaction[]>;
}
