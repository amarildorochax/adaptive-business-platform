import type { Payment } from './Payment';

/** Contrato de persistência de Payment — apenas o contrato, per Etapa 7. */
export interface PaymentRepository {
  create(payment: Payment): Promise<Payment>;
  update(payment: Payment): Promise<Payment>;
  get(paymentId: string): Promise<Payment | undefined>;
  list(invoiceId: string): Promise<Payment[]>;
}
