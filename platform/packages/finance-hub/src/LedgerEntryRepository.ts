import type { LedgerEntry } from './LedgerEntry';

/**
 * Contrato de persistência de Ledger Entry — apenas o contrato, per Etapa 7. **Nunca declara
 * `update` nem `remove`** — Ledger Is Immutable (`FinBusinessRule.ts`) é enforçada estruturalmente
 * por este contrato, não apenas por convenção; apenas `LedgerManager`/`LedgerService` (via
 * `create`/`listByAccount`) tem acesso a este Repository (ver `FinanceManager`).
 */
export interface LedgerEntryRepository {
  create(ledgerEntry: LedgerEntry): Promise<LedgerEntry>;
  listByAccount(financialAccountId: string): Promise<LedgerEntry[]>;
  listByTransaction(transactionId: string): Promise<LedgerEntry[]>;
}
