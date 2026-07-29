// RequestIdMiddleware.ts
//
// Responsabilidade:
// Garante que `requestContext.requestId` esteja preenchido — mesmo
// papel de `CorrelationIdMiddleware`, para o identificador da
// requisição individual (distinto da correlação, que pode abranger
// várias requisições relacionadas).

import { createRequestId } from '../utils/correlationId';
import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';
import type { PipelineContext } from '../context/PipelineContext';

export const requestIdMiddleware: PipelineMiddleware = {
  name: 'request-id',
  priority: 20,

  beforeExecute(context: PipelineContext): PipelineContext {
    if (context.requestContext.requestId) return context;

    return {
      ...context,
      requestContext: { ...context.requestContext, requestId: createRequestId() },
    };
  },
};
