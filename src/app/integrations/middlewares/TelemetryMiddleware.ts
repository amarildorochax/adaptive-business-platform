// TelemetryMiddleware.ts
//
// Responsabilidade:
// Consome `ObservabilityHooks` já definidos na Sprint 30
// (`types/Observability.ts`) — inicia/encerra um `TraceSpan` e registra
// uma `MetricSample` por execução. Com `noopObservabilityHooks`,
// nenhum efeito observável real ocorre.

import { noopObservabilityHooks } from '../types/Observability';
import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';
import type { PipelineContext } from '../context/PipelineContext';
import type { PipelineResponse } from '../pipeline/PipelineResponse';

export const telemetryMiddleware: PipelineMiddleware = {
  name: 'telemetry',
  priority: 120,

  beforeExecute(context: PipelineContext): PipelineContext {
    noopObservabilityHooks.startTrace(`pipeline.${context.request.moduleId}.${context.request.operation}`, context.requestContext.correlationId);
    return context;
  },

  afterExecute<Data>(context: PipelineContext, response: PipelineResponse<Data>): PipelineResponse<Data> {
    noopObservabilityHooks.recordMetric({
      name: `pipeline.${context.request.moduleId}.${context.request.operation}.success`,
      value: 1,
    });
    return response;
  },

  onError(context: PipelineContext): void {
    noopObservabilityHooks.recordMetric({
      name: `pipeline.${context.request.moduleId}.${context.request.operation}.error`,
      value: 1,
    });
  },
};
