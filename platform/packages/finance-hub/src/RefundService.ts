import type { Refund } from './Refund';
import type { RefundRepository } from './RefundRepository';

/**
 * RefundService — nenhum precedente legado foi encontrado. Sempre referencia o Payment original,
 * nunca o altera (RefundCreatesNewTransactions, `FinBusinessRule.ts`) — a criação do novo Transaction
 * e Ledger Entry correspondente é responsabilidade de FinanceManager, nunca deste Service. Nenhuma
 * emissão de Evento aqui — responsabilidade exclusiva de FinanceManager.
 */
export class RefundService {
  constructor(private readonly repository: RefundRepository) {}

  async process(tenantId: string, paymentId: string, amount: number): Promise<Refund> {
    const refund: Refund = {
      refundId: crypto.randomUUID(),
      tenantId,
      paymentId,
      amount,
      processedAt: new Date(),
    };

    return this.repository.create(refund);
  }

  async list(paymentId: string): Promise<readonly Refund[]> {
    return this.repository.list(paymentId);
  }
}
