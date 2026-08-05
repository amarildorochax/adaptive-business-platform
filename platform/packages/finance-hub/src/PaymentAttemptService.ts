import type { PaymentAttempt } from './PaymentAttempt';
import type { PaymentAttemptRepository } from './PaymentAttemptRepository';

/**
 * PaymentAttemptService — nenhum precedente legado foi encontrado. Registra cada tentativa
 * individual de processar um Payment, independentemente de sucesso ou falha (Blueprint, Capítulo 4)
 * — nunca processa o `Charge` em si, que é mediado exclusivamente pelo Integration Hub, fora do
 * escopo desta Sprint. Nenhuma emissão de Evento aqui — responsabilidade exclusiva de FinanceManager.
 */
export class PaymentAttemptService {
  constructor(private readonly repository: PaymentAttemptRepository) {}

  async record(paymentId: string, succeeded: boolean): Promise<PaymentAttempt> {
    const paymentAttempt: PaymentAttempt = {
      paymentAttemptId: crypto.randomUUID(),
      paymentId,
      succeeded,
      attemptedAt: new Date(),
    };

    return this.repository.create(paymentAttempt);
  }

  async list(paymentId: string): Promise<readonly PaymentAttempt[]> {
    return this.repository.list(paymentId);
  }
}
