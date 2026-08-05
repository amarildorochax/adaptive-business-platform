import type { Balance } from './Balance';

/**
 * Contrato de persistência de Balance — apenas o contrato, per Etapa 7. `save` sempre recebe um
 * Balance recém-recalculado pelo `BalanceService` a partir do Ledger (Balance Is Derived,
 * `FINANCE_HUB.md`, Capítulo 5) — este Repository nunca é a fonte de verdade, apenas um cache do
 * último valor já recalculado.
 */
export interface BalanceRepository {
  save(balance: Balance): Promise<Balance>;
  get(financialAccountId: string): Promise<Balance | undefined>;
}
