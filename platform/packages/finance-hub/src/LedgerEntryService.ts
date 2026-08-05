import type { LedgerEntry, LedgerEntryType } from './LedgerEntry';
import type { LedgerEntryRepository } from './LedgerEntryRepository';

/**
 * LedgerEntryService — o guardião técnico da imutabilidade do Ledger (Ledger Manager, `FINANCE_HUB.md`,
 * Capítulo 7) — nenhum outro Service deste pacote grava um Ledger Entry diretamente; todos delegam
 * essa gravação exclusivamente a este Service, tratado como uma operação de apenas-anexar
 * (`LedgerEntryRepository` nunca declara `update`/`remove`). Nenhum precedente legado foi encontrado
 * — `src/core/finance` não modela registro contábil de partida dobrada.
 */
export class LedgerEntryService {
  constructor(private readonly repository: LedgerEntryRepository) {}

  async record(financialAccountId: string, transactionId: string, type: LedgerEntryType, amount: number): Promise<LedgerEntry> {
    const ledgerEntry: LedgerEntry = {
      ledgerEntryId: crypto.randomUUID(),
      financialAccountId,
      transactionId,
      type,
      amount,
      createdAt: new Date(),
    };

    return this.repository.create(ledgerEntry);
  }

  async listByAccount(financialAccountId: string): Promise<readonly LedgerEntry[]> {
    return this.repository.listByAccount(financialAccountId);
  }

  async listByTransaction(transactionId: string): Promise<readonly LedgerEntry[]> {
    return this.repository.listByTransaction(transactionId);
  }
}
