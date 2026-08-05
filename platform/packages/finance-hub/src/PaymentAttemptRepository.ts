import type { PaymentAttempt } from './PaymentAttempt';

/** Contrato de persistência de Payment Attempt — apenas o contrato, per Etapa 7. Sem `update`/`remove` — cada tentativa é um registro histórico imutável, independentemente de sucesso ou falha. */
export interface PaymentAttemptRepository {
  create(paymentAttempt: PaymentAttempt): Promise<PaymentAttempt>;
  list(paymentId: string): Promise<PaymentAttempt[]>;
}
