import type { FinancialAccount } from './FinancialAccount';

/** Contrato de persistência de Financial Account — apenas o contrato, per Etapa 7. */
export interface FinancialAccountRepository {
  create(account: FinancialAccount): Promise<FinancialAccount>;
  get(financialAccountId: string): Promise<FinancialAccount | undefined>;
  list(tenantId: string): Promise<FinancialAccount[]>;
}
