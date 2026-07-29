/**
 * Payment Attempt — tentativa individual de processar um Payment, distinta do Payment em si porque
 * uma mesma cobrança pode exigir múltiplas tentativas; cada uma mantém registro do Charge processado
 * através do Integration Hub, independentemente de sucesso ou falha.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 4.
 */
export interface PaymentAttempt {
  /** Identificador do Payment Attempt. */
  readonly paymentAttemptId: string;

  /** Payment ao qual esta tentativa se refere. */
  readonly paymentId: string;

  /** Se esta tentativa foi bem-sucedida. */
  readonly succeeded: boolean;

  /** Momento da tentativa. */
  readonly attemptedAt: Date;
}
