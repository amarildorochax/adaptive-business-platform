import type { FinancialAccount } from './FinancialAccount';
import type { FinancialAccountRepository } from './FinancialAccountRepository';

/**
 * FinancialAccountService — nenhum precedente legado foi encontrado (`src/core/finance` não modela
 * conta financeira própria; ver relatório desta Sprint). O Finance Hub nunca lê Customer diretamente
 * — `relationshipId` é sempre uma referência opaca ao CRM Hub (Blueprint, Capítulo 5). Nenhuma
 * emissão de Evento aqui — responsabilidade exclusiva de FinanceManager.
 */
export class FinancialAccountService {
  constructor(private readonly repository: FinancialAccountRepository) {}

  async create(tenantId: string, relationshipId?: string): Promise<FinancialAccount> {
    const account: FinancialAccount = {
      financialAccountId: crypto.randomUUID(),
      tenantId,
      relationshipId,
      createdAt: new Date(),
    };

    return this.repository.create(account);
  }

  async get(financialAccountId: string): Promise<FinancialAccount | undefined> {
    return this.repository.get(financialAccountId);
  }

  async list(tenantId: string): Promise<readonly FinancialAccount[]> {
    return this.repository.list(tenantId);
  }
}
