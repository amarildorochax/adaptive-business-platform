import type { Balance } from './Balance';
import type { BalanceRepository } from './BalanceRepository';
import type { LedgerEntryRepository } from './LedgerEntryRepository';

/**
 * BalanceService — Balance Is Derived (`FINANCE_HUB.md`, Capítulo 5): `recalculate` sempre soma, do
 * zero, todo Ledger Entry já registrado para a Financial Account (Credit soma, Debit subtrai) —
 * nunca incrementa um valor armazenado anteriormente, garantindo que o resultado seja sempre
 * idêntico ao que uma reconstrução completa a partir do Ledger produziria (Event Sourcing Friendly).
 * Nenhum precedente legado foi encontrado.
 */
export class BalanceService {
  constructor(
    private readonly repository: BalanceRepository,
    private readonly ledgerEntries: LedgerEntryRepository,
  ) {}

  async recalculate(financialAccountId: string): Promise<Balance> {
    const entries = await this.ledgerEntries.listByAccount(financialAccountId);

    const amount = entries.reduce((total, entry) => {
      return entry.type === 'Credit' ? total + entry.amount : total - entry.amount;
    }, 0);

    return this.repository.save({ financialAccountId, amount, recalculatedAt: new Date() });
  }

  async get(financialAccountId: string): Promise<Balance | undefined> {
    return this.repository.get(financialAccountId);
  }
}
