import type { Transaction } from './Transaction';
import type { TransactionRepository } from './TransactionRepository';

/**
 * TransactionService — nenhum precedente legado foi encontrado. `create` sempre recebe um
 * `transactionId` já definido pelo chamador (`FinanceManager`) e o conjunto completo de
 * `ledgerEntryIds` já conhecido — Immutable Transactions (`FINANCE_HUB.md`, Capítulo 5) exige que uma
 * Transaction nasça inteiramente formada, nunca seja editada depois para anexar mais Ledger Entry
 * (por isso `TransactionRepository` nunca declara `update`). O `transactionId` precisa ser definido
 * antes da criação de cada Ledger Entry do grupo — por isso não é gerado internamente aqui, mesmo
 * padrão de coordenação já usado por `FinanceManager.capturePayment`/`issueRefund`.
 */
export class TransactionService {
  constructor(private readonly repository: TransactionRepository) {}

  async create(tenantId: string, transactionId: string, ledgerEntryIds: readonly string[]): Promise<Transaction> {
    const transaction: Transaction = {
      transactionId,
      tenantId,
      ledgerEntryIds,
      createdAt: new Date(),
    };

    return this.repository.create(transaction);
  }

  async get(transactionId: string): Promise<Transaction | undefined> {
    return this.repository.get(transactionId);
  }
}
