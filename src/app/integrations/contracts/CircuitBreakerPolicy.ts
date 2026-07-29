// CircuitBreakerPolicy.ts
//
// Responsabilidade:
// Contrato de Circuit Breaker por módulo — apenas a estrutura de
// estado/política. Nenhuma lógica real de abertura/recuperação de
// circuito existe nesta Sprint (`CircuitBreakerMiddleware` sempre
// considera o circuito `'closed'`).

export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerPolicy {
  failureThreshold: number;
  recoveryTimeMs: number;
}

export interface CircuitBreakerSnapshot {
  moduleId: string;
  state: CircuitBreakerState;
  failureCount: number;
}

export const defaultCircuitBreakerPolicy: CircuitBreakerPolicy = {
  failureThreshold: 5,
  recoveryTimeMs: 30000,
};
