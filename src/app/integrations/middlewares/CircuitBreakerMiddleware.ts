// CircuitBreakerMiddleware.ts
//
// Responsabilidade:
// Consome o contrato `CircuitBreakerSnapshot` (Sprint 31A) — nesta
// Sprint o circuito de todo módulo é sempre considerado `'closed'`
// (nunca abre), então `shouldExecute` nunca bloqueia. Nenhuma contagem
// real de falhas é mantida; `defaultCircuitBreakerPolicy` existe apenas
// como configuração reservada para quando a lógica real for
// implementada.

import type { CircuitBreakerSnapshot } from '../contracts/CircuitBreakerPolicy';
import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';
import type { PipelineContext } from '../context/PipelineContext';

function currentSnapshot(context: PipelineContext): CircuitBreakerSnapshot {
  return { moduleId: context.request.moduleId, state: 'closed', failureCount: 0 };
}

export const circuitBreakerMiddleware: PipelineMiddleware = {
  name: 'circuit-breaker',
  priority: 80,

  shouldExecute(context: PipelineContext): boolean {
    return currentSnapshot(context).state !== 'open';
  },
};
