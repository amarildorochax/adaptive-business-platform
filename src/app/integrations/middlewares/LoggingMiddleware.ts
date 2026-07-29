// LoggingMiddleware.ts
//
// Responsabilidade:
// Consome `ObservabilityHooks.log()` (Sprint 30) para registrar início/
// fim/erro de uma execução do pipeline. Com `noopObservabilityHooks`,
// nenhum log real é emitido.

import { noopObservabilityHooks } from '../types/Observability';
import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';
import type { PipelineContext } from '../context/PipelineContext';
import type { PipelineResponse } from '../pipeline/PipelineResponse';
import type { CoreIntegrationError } from '../errors/CoreIntegrationError';

export const loggingMiddleware: PipelineMiddleware = {
  name: 'logging',
  priority: 130,

  beforeExecute(context: PipelineContext): PipelineContext {
    noopObservabilityHooks.log({
      level: 'debug',
      message: `Iniciando ${context.request.operation} em "${context.request.moduleId}".`,
      correlationId: context.requestContext.correlationId,
      timestamp: new Date().toISOString(),
    });
    return context;
  },

  afterExecute<Data>(context: PipelineContext, response: PipelineResponse<Data>): PipelineResponse<Data> {
    noopObservabilityHooks.log({
      level: 'info',
      message: `Concluído ${context.request.operation} em "${context.request.moduleId}".`,
      correlationId: context.requestContext.correlationId,
      timestamp: new Date().toISOString(),
    });
    return response;
  },

  onError(context: PipelineContext, error: CoreIntegrationError): void {
    noopObservabilityHooks.log({
      level: 'error',
      message: `Falha em ${context.request.operation} em "${context.request.moduleId}": ${error.message}`,
      correlationId: context.requestContext.correlationId,
      timestamp: new Date().toISOString(),
    });
  },
};
