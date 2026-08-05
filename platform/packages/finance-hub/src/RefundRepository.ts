import type { Refund } from './Refund';

/** Contrato de persistência de Refund — apenas o contrato, per Etapa 7. Sem `update`/`remove` — imutável a partir do processamento (RefundCreatesNewTransactions, FinBusinessRule.ts). */
export interface RefundRepository {
  create(refund: Refund): Promise<Refund>;
  get(refundId: string): Promise<Refund | undefined>;
  list(paymentId: string): Promise<Refund[]>;
}
