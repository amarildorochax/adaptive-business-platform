// CorrelationIdMiddleware.ts
//
// Responsabilidade:
// Garante que `requestContext.correlationId` esteja preenchido antes
// de qualquer outro Middleware rodar — o único middleware, junto de
// `RequestIdMiddleware`, com efeito real (gera um id) nesta Sprint.

import { createCorrelationId } from '../utils/correlationId';
import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';
import type { PipelineContext } from '../context/PipelineContext';

export const correlationIdMiddleware: PipelineMiddleware = {
  name: 'correlation-id',
  priority: 10,

  beforeExecute(context: PipelineContext): PipelineContext {
    if (context.requestContext.correlationId) return context;

    return {
      ...context,
      requestContext: { ...context.requestContext, correlationId: createCorrelationId() },
    };
  },
};
