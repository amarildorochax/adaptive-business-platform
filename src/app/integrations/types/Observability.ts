// Observability.ts
//
// Responsabilidade:
// Pontos de integração preparados para Logs/Tracing/Metrics/
// CorrelationId/RequestId — consumidos pelos Adapters e Hooks desta
// Sprint. `noopObservabilityHooks` não faz nada; é o valor padrão até
// uma Sprint futura conectar um coletor real (ex.: a Observability do
// Core, ou um serviço externo), sem exigir mudança de contrato.

export interface CorrelationId {
  value: string;
}

export interface RequestId {
  value: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  correlationId?: string;
  timestamp: string;
}

export interface TraceSpan {
  name: string;
  correlationId?: string;
  startedAt: string;
  endedAt?: string;
}

export interface MetricSample {
  name: string;
  value: number;
  tags?: Record<string, string>;
}

export interface ObservabilityHooks {
  log(entry: LogEntry): void;
  startTrace(name: string, correlationId?: string): TraceSpan;
  endTrace(span: TraceSpan): void;
  recordMetric(sample: MetricSample): void;
}

/** Hooks nulos — nenhuma chamada aqui produz efeito observável. Valor padrão até um coletor real existir. */
export const noopObservabilityHooks: ObservabilityHooks = {
  log: () => undefined,
  startTrace: (name, correlationId) => ({ name, correlationId, startedAt: new Date().toISOString() }),
  endTrace: () => undefined,
  recordMetric: () => undefined,
};
