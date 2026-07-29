// TimeoutMiddleware.ts
//
// Responsabilidade:
// Consome `TimeoutPolicy` (Sprint 31A) — apenas carrega a configuração;
// nenhum cancelamento/`Promise.race` real é aplicado nesta Sprint
// ("Nenhuma implementação efetiva", conforme o ESCOPO).

import { defaultTimeoutPolicy } from '../contracts/TimeoutPolicy';
import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';
import type { PipelineContext } from '../context/PipelineContext';

export const timeoutMiddleware: PipelineMiddleware = {
  name: 'timeout',
  priority: 110,

  beforeExecute(context: PipelineContext): PipelineContext {
    // `defaultTimeoutPolicy.timeoutMs` reservado para quando o cancelamento real for implementado.
    void defaultTimeoutPolicy.timeoutMs;
    return context;
  },
};
