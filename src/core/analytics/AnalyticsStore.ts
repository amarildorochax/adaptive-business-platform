import type { AnalyticsMetric } from "./AnalyticsMetric";
import type { AnalyticsSnapshot } from "./AnalyticsSnapshot";
import type { AnalyticsReport } from "./AnalyticsReport";

/**
 * Armazenamento de AnalyticsMetric/AnalyticsSnapshot/AnalyticsReport —
 * exclusivamente em memória (`Map`), sem persistência (Tarefa 07).
 * Único Store desta Sprint — guarda as três entidades do domínio, cada
 * uma em seu próprio `Map`, indexado por `id`.
 *
 * Responsabilidade: guardar e recuperar por identificador — nenhuma
 * agregação/cálculo (isso é responsabilidade de AnalyticsService) e
 * nenhuma emissão de evento (isso é responsabilidade de
 * AnalyticsManager).
 *
 * Consumido exclusivamente por AnalyticsService.
 */
export class AnalyticsStore {
  private metrics = new Map<string, AnalyticsMetric>();

  private snapshots = new Map<string, AnalyticsSnapshot>();

  private reports = new Map<string, AnalyticsReport>();

  /** Adiciona uma nova AnalyticsMetric. */
  addMetric(metric: AnalyticsMetric): void {
    this.metrics.set(metric.id, metric);
  }

  /** Retorna todas as AnalyticsMetric já coletadas. */
  getAllMetrics(): AnalyticsMetric[] {
    return Array.from(this.metrics.values());
  }

  /** Adiciona uma nova AnalyticsSnapshot. */
  addSnapshot(snapshot: AnalyticsSnapshot): void {
    this.snapshots.set(snapshot.id, snapshot);
  }

  /** Retorna a AnalyticsSnapshot de `id`, ou `undefined` se não existir. */
  getSnapshot(id: string): AnalyticsSnapshot | undefined {
    return this.snapshots.get(id);
  }

  /** Retorna todas as AnalyticsSnapshot já criadas. */
  getAllSnapshots(): AnalyticsSnapshot[] {
    return Array.from(this.snapshots.values());
  }

  /** Adiciona um novo AnalyticsReport. */
  addReport(report: AnalyticsReport): void {
    this.reports.set(report.id, report);
  }

  /** Retorna todos os AnalyticsReport já criados. */
  getAllReports(): AnalyticsReport[] {
    return Array.from(this.reports.values());
  }

  /** Remove todos os dados armazenados (as três entidades). */
  clear(): void {
    this.metrics.clear();
    this.snapshots.clear();
    this.reports.clear();
  }
}
