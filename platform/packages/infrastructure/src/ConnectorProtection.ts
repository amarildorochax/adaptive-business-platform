/**
 * Connector Protection — as quatro camadas de proteção de comunicação com Provider externo,
 * todas aplicadas individualmente por Connector: Rate Limit, Timeout, Retry, Circuit Breaker.
 * Estrutura, regras e invariantes definidas em INTEGRATION_RESILIENCE_CONCRETE_STRUCTURE.md.
 */
export interface RateLimitRule {
  /** Nome do Connector ao qual esta regra se aplica. */
  readonly connectorName: string;

  /** Número máximo de chamadas permitidas na janela de tempo. */
  readonly maxRequests: number;

  /** Duração da janela de tempo, em segundos. */
  readonly windowSeconds: number;
}

export interface TimeoutPolicy {
  /** Nome do Connector ao qual esta política se aplica. */
  readonly connectorName: string;

  /** Tempo máximo de espera por resposta, em milissegundos. */
  readonly timeoutMs: number;
}

export interface RetryPolicy {
  /** Nome do Connector ao qual esta política se aplica. */
  readonly connectorName: string;

  /** Número máximo de tentativas, preservando Idempotência — nunca produz efeito duplicado. */
  readonly maxAttempts: number;
}

export interface CircuitBreakerState {
  /** Nome do Connector ao qual este estado se refere. */
  readonly connectorName: string;

  /** Se a comunicação com este Connector está temporariamente interrompida. */
  readonly isOpen: boolean;

  /** Momento em que a interrupção começou, quando aberta. */
  readonly openedAt?: Date;
}
