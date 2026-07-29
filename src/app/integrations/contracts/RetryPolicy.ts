// RetryPolicy.ts
//
// Responsabilidade:
// Estratégia de retry — apenas a estrutura de configuração. Nenhuma
// chamada é de fato repetida nesta Sprint (`RetryMiddleware` só
// registra `executionContext.attempt`, nunca laça).

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
}

/** Política padrão — 1 tentativa, sem backoff (equivalente a "sem retry"). */
export const noRetryPolicy: RetryPolicy = {
  maxAttempts: 1,
  backoffMs: 0,
};
