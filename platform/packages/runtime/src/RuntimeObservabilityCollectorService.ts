import type { DispatchMetric, DispatchMetricKind } from "./DispatchMetric.js";
import type { DispatchMetricRepository } from "./DispatchMetricRepository.js";

/**
 * Runtime Observability Collector Service — implementa o "Runtime Observability Collector"
 * (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 4 e 12): "Produz Logs, Tracing e Métricas de nível de
 * execução... complementares — nunca duplicados — aos já produzidos pelo Metrics Engine do
 * Automation Engine." Restrito às três `DispatchMetricKind` já cataloguadas em `DispatchMetric.ts`
 * (`DispatchVolume`/`DispatchLatency`/`DispatchSuccessRate`) — nunca Logs nem Tracing de nível de
 * execução completo, que pertencem a `@abp/infrastructure` (`LogRecord`/`Span`, IMP-012); este
 * Service produz exclusivamente o sinal de nível de Dispatch, nunca duplicando aquele pacote.
 */
export class RuntimeObservabilityCollectorService {
  constructor(private readonly repository: DispatchMetricRepository) {}

  async record(kind: DispatchMetricKind, value: number): Promise<DispatchMetric> {
    const metric: DispatchMetric = { dispatchMetricId: crypto.randomUUID(), kind, value, observedAt: new Date() };
    return this.repository.create(metric);
  }

  async listByKind(kind: DispatchMetricKind): Promise<readonly DispatchMetric[]> {
    return this.repository.listByKind(kind);
  }
}
