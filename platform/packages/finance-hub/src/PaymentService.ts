import type { Payment } from './Payment';
import type { PaymentRepository } from './PaymentRepository';

/**
 * PaymentService — nenhum precedente legado foi encontrado (ver relatório desta Sprint). O estado
 * inicial `Intent` já representa o registro de intenção de pagamento (Payment.ts, doc-comment) — não
 * uma Entidade separada. Nenhuma emissão de Evento aqui — responsabilidade exclusiva de
 * FinanceManager.
 */
export class PaymentService {
  constructor(private readonly repository: PaymentRepository) {}

  async create(tenantId: string, invoiceId: string, amount: number): Promise<Payment> {
    const payment: Payment = {
      paymentId: crypto.randomUUID(),
      tenantId,
      invoiceId,
      status: 'Intent',
      amount,
      createdAt: new Date(),
    };

    return this.repository.create(payment);
  }

  async authorize(paymentId: string): Promise<Payment> {
    return this.transition(paymentId, 'Authorized');
  }

  async capture(paymentId: string): Promise<Payment> {
    return this.transition(paymentId, 'Captured');
  }

  async fail(paymentId: string): Promise<Payment> {
    return this.transition(paymentId, 'Failed');
  }

  async get(paymentId: string): Promise<Payment | undefined> {
    return this.repository.get(paymentId);
  }

  async list(invoiceId: string): Promise<readonly Payment[]> {
    return this.repository.list(invoiceId);
  }

  private async transition(paymentId: string, status: Payment['status']): Promise<Payment> {
    const existing = await this.repository.get(paymentId);

    if (!existing) {
      throw new Error(`Payment ${paymentId} não encontrado.`);
    }

    return this.repository.update({ ...existing, status });
  }
}
