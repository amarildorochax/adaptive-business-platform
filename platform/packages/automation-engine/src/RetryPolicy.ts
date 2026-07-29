/**
 * Retry Policy — toda Action sujeita a falha transitória possui política de nova tentativa definida
 * desde sua concepção, com espera progressiva (Retry by Design, `AUTOMATION_ENGINE.md`, Capítulo 5,
 * ADR-007). Nenhuma tecnologia concreta de espera é definida — `backoffDescription` permanece
 * opaca.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export interface RetryPolicy {
  /** Identificador da Retry Policy. */
  readonly retryPolicyId: string;

  /** Número máximo de tentativas. */
  readonly maxAttempts: number;

  /** Descrição opaca da estratégia de espera progressiva — nenhuma tecnologia concreta definida. */
  readonly backoffDescription: string;
}
