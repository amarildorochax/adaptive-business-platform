// RetryMiddleware.ts
//
// Responsabilidade:
// Consome `RetryPolicy` (Sprint 31A) — nesta Sprint apenas registra a
// tentativa atual em `executionContext.attempt`; nenhum laço real de
// nova tentativa existe (`noRetryPolicy.maxAttempts === 1`). A
// estrutura está pronta para um `PipelineExecutor` futuro (ou um
// Middleware evoluído) implementar o laço real de retry usando esta
// mesma política, sem mudar o contrato.

import { noRetryPolicy } from '../contracts/RetryPolicy';
import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';
import type { PipelineContext } from '../context/PipelineContext';

export const retryMiddleware: PipelineMiddleware = {
  name: 'retry',
  priority: 100,

  beforeExecute(context: PipelineContext): PipelineContext {
    const attempt = Math.min(context.executionContext.attempt, noRetryPolicy.maxAttempts);
    return { ...context, executionContext: { ...context.executionContext, attempt } };
  },
};
