import type { AnalyticsMetric } from "./AnalyticsMetric";
import type { AnalyticsSnapshot } from "./AnalyticsSnapshot";
import type { AnalyticsReport } from "./AnalyticsReport";
import { AnalyticsStore } from "./AnalyticsStore";

/** Campos aceitos por `AnalyticsService.collectMetric()`. */
export type AnalyticsMetricInput = Pick<AnalyticsMetric, "name" | "value" | "source" | "metadata">;

/** Campos aceitos por `AnalyticsService.createReport()`. */
export type AnalyticsReportInput = Pick<AnalyticsReport, "title" | "snapshotId" | "metadata">;

/**
 * Coleta, agregação, snapshots e relatórios (Tarefa 08).
 *
 * `createSnapshot()` sempre consolida **todas** as AnalyticsMetric já
 * coletadas até o momento (cumulativo — nenhuma métrica é descartada ou
 * "consumida" ao entrar em um snapshot; a mesma métrica pode aparecer
 * em vários snapshots).
 *
 * `createReport()` nunca usa IA (fora do escopo desta Sprint) —
 * `buildSummary()` calcula um resumo determinístico (contagem, média,
 * mínimo, máximo) sobre `AnalyticsSnapshot.metrics`.
 *
 * Stateless em relação a eventos/métricas de uso — isso é
 * responsabilidade de AnalyticsManager.
 *
 * Dependências: AnalyticsStore (própria instância).
 *
 * Consumido exclusivamente por AnalyticsManager.
 */
export class AnalyticsService {
  private readonly store = new AnalyticsStore();

  /** Registra uma nova AnalyticsMetric já coletada por quem chama (nunca busca o valor sozinho). */
  collectMetric(input: AnalyticsMetricInput): AnalyticsMetric {
    const metric: AnalyticsMetric = {
      id: crypto.randomUUID(),
      name: input.name,
      value: input.value,
      source: input.source,
      metadata: input.metadata,
      collectedAt: new Date(),
    };

    this.store.addMetric(metric);

    return metric;
  }

  /** Retorna todas as AnalyticsMetric já coletadas. */
  listMetrics(): AnalyticsMetric[] {
    return this.store.getAllMetrics();
  }

  /** Cria uma nova AnalyticsSnapshot consolidando todas as AnalyticsMetric já coletadas. */
  createSnapshot(): AnalyticsSnapshot {
    const snapshot: AnalyticsSnapshot = {
      id: crypto.randomUUID(),
      generatedAt: new Date(),
      metrics: this.store.getAllMetrics(),
      metadata: {},
    };

    this.store.addSnapshot(snapshot);

    return snapshot;
  }

  /** Retorna a AnalyticsSnapshot de `id`, ou `undefined` se não existir. */
  getSnapshot(id: string): AnalyticsSnapshot | undefined {
    return this.store.getSnapshot(id);
  }

  /** Retorna todas as AnalyticsSnapshot já criadas. */
  listSnapshots(): AnalyticsSnapshot[] {
    return this.store.getAllSnapshots();
  }

  /**
   * Cria um novo AnalyticsReport a partir de uma AnalyticsSnapshot já
   * existente. Retorna `undefined` se `input.snapshotId` não existir.
   */
  createReport(input: AnalyticsReportInput): AnalyticsReport | undefined {
    const snapshot = this.store.getSnapshot(input.snapshotId);

    if (!snapshot) {
      return undefined;
    }

    const report: AnalyticsReport = {
      id: crypto.randomUUID(),
      title: input.title,
      snapshotId: input.snapshotId,
      summary: this.buildSummary(snapshot),
      metadata: input.metadata,
      generatedAt: new Date(),
    };

    this.store.addReport(report);

    return report;
  }

  /** Retorna todos os AnalyticsReport já criados. */
  listReports(): AnalyticsReport[] {
    return this.store.getAllReports();
  }

  /** Resumo determinístico (contagem/média/mínimo/máximo) — nunca gerado por IA. */
  private buildSummary(snapshot: AnalyticsSnapshot): string {
    const values = snapshot.metrics.map((metric) => metric.value);

    if (values.length === 0) {
      return "Snapshot sem métricas coletadas.";
    }

    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return `Snapshot com ${values.length} métrica(s): valor médio ${average.toFixed(2)}, mínimo ${min.toFixed(2)}, máximo ${max.toFixed(2)}.`;
  }
}
