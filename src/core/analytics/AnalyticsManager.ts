import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import type { AnalyticsMetric } from "./AnalyticsMetric";
import type { AnalyticsSnapshot } from "./AnalyticsSnapshot";
import type { AnalyticsReport } from "./AnalyticsReport";
import { AnalyticsService, type AnalyticsMetricInput, type AnalyticsReportInput } from "./AnalyticsService";
import { AnalyticsMetrics, type AnalyticsMetricsSnapshot } from "./AnalyticsMetrics";

/**
 * Coordena todas as operações do Business Analytics (Tarefa 03) —
 * delega coleta/agregação/snapshot/relatório a AnalyticsService,
 * registra AnalyticsMetrics (uso do próprio módulo) e emite os eventos
 * de ciclo de vida (ANALYTICS_METRIC_COLLECTED/
 * ANALYTICS_SNAPSHOT_CREATED/ANALYTICS_REPORT_CREATED).
 *
 * **Nunca acessa nenhum outro módulo diretamente** — nenhum import de
 * CRM/Campaign/Marketing/Finance/Automation/Notifications/etc. existe
 * neste arquivo, nem em nenhum outro de `@/core/analytics/`. Uma
 * AnalyticsMetric só chega aqui via `collectMetric()`, chamado por
 * quem já consultou a fachada pública do domínio de origem — este
 * módulo nunca busca o valor sozinho.
 *
 * Consumido exclusivamente por Analytics (fachada).
 */
export class AnalyticsManager {
  private readonly service = new AnalyticsService();

  private readonly metrics = new AnalyticsMetrics();

  /** Registra uma nova AnalyticsMetric já coletada por quem chama. */
  collectMetric(input: AnalyticsMetricInput): AnalyticsMetric {
    const metric = this.service.collectMetric(input);
    this.metrics.recordMutation();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.ANALYTICS_METRIC_COLLECTED,
      source: "AnalyticsManager",
      payload: { id: metric.id, name: metric.name, source: metric.source },
      createdAt: metric.collectedAt,
    });

    return metric;
  }

  /** Cria uma nova AnalyticsSnapshot consolidando todas as AnalyticsMetric já coletadas. */
  createSnapshot(): AnalyticsSnapshot {
    const snapshot = this.service.createSnapshot();
    this.metrics.recordMutation();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.ANALYTICS_SNAPSHOT_CREATED,
      source: "AnalyticsManager",
      payload: { id: snapshot.id, metricsCount: snapshot.metrics.length },
      createdAt: snapshot.generatedAt,
    });

    return snapshot;
  }

  /** Retorna a AnalyticsSnapshot de `id`, ou `undefined` se não existir. Registra consulta. */
  getSnapshot(id: string): AnalyticsSnapshot | undefined {
    this.metrics.recordQuery();
    return this.service.getSnapshot(id);
  }

  /** Cria um novo AnalyticsReport a partir de uma AnalyticsSnapshot já existente. Retorna `undefined` se ela não existir. */
  createReport(input: AnalyticsReportInput): AnalyticsReport | undefined {
    const report = this.service.createReport(input);

    if (report) {
      this.metrics.recordMutation();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.ANALYTICS_REPORT_CREATED,
        source: "AnalyticsManager",
        payload: { id: report.id, snapshotId: report.snapshotId },
        createdAt: report.generatedAt,
      });
    }

    return report;
  }

  /** Retorna todos os AnalyticsReport já criados. Registra consulta. */
  listReports(): AnalyticsReport[] {
    this.metrics.recordQuery();
    return this.service.listReports();
  }

  /** Métricas agregadas de uso do Business Analytics. */
  getMetrics(): AnalyticsMetricsSnapshot {
    this.metrics.recordQuery();

    return this.metrics.snapshot({
      reports: this.service.listReports().length,
      snapshots: this.service.listSnapshots().length,
      metrics: this.service.listMetrics().length,
    });
  }
}
