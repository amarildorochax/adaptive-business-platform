import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import { analytics } from "@/core/analytics/Analytics";
import type { AnalyticsSnapshot } from "@/core/analytics/AnalyticsSnapshot";
import type { AnalyticsReport } from "@/core/analytics/AnalyticsReport";
import type { DashboardSnapshotView } from "./DashboardSnapshotView";
import { DashboardAnalyticsMetrics, type DashboardAnalyticsMetricsSnapshot } from "./DashboardAnalyticsMetrics";

/**
 * Ponte entre o Adaptive Dashboard e o Business Analytics (Sprint 18,
 * Tarefa 01) — consome exclusivamente `analytics.getSnapshot()`/
 * `analytics.listReports()` (Tarefa 03), nunca `AnalyticsManager`/
 * `AnalyticsService`/`AnalyticsStore`, nunca nenhuma entidade interna.
 *
 * `Analytics` não expõe "pegar o snapshot mais recente" diretamente
 * (`getSnapshot()` exige um `id` já conhecido) — resolvido usando
 * apenas API pública já existente (Tarefa 08: "exceto APIs públicas já
 * existentes"): `loadSnapshot()` busca todos os AnalyticsReport via
 * `listReports()`, seleciona o mais recente por `generatedAt`, e usa o
 * `snapshotId` desse relatório para chamar `getSnapshot(id)` — nenhum
 * método novo foi necessário em `Analytics`.
 *
 * `refresh()` (Tarefa 02) executa `loadSnapshot()` + `loadReports()`
 * como uma unidade, cacheia os resultados, registra
 * DashboardAnalyticsMetrics e emite DASHBOARD_REFRESH_STARTED/
 * DASHBOARD_REFRESH_COMPLETED — os únicos dois eventos emitidos por
 * este arquivo (Tarefa 07).
 *
 * `toSnapshotView()` apenas reformata uma AnalyticsSnapshot já pronta
 * (`DashboardSnapshotView`) — nenhuma agregação/cálculo novo (REGRA:
 * "nenhuma lógica analítica deverá existir no Dashboard" — toda
 * consolidação já aconteceu em `@/core/analytics`).
 *
 * Consumido exclusivamente por AnalyticsWidget (`@/core/dashboard/
 * AnalyticsWidget.ts`) — nenhum outro widget deve importar este
 * arquivo nem `@/core/analytics` diretamente (Tarefa 04).
 */
export class DashboardAnalyticsProvider {
  private readonly metrics = new DashboardAnalyticsMetrics();

  private snapshotView: DashboardSnapshotView | undefined;

  private reports: AnalyticsReport[] = [];

  /** Executa `loadSnapshot()` + `loadReports()` como uma unidade; emite os eventos de ciclo de vida. */
  refresh(): void {
    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.DASHBOARD_REFRESH_STARTED,
      source: "DashboardAnalyticsProvider",
      payload: {},
      createdAt: new Date(),
    });

    this.snapshotView = this.loadSnapshot();
    this.reports = this.loadReports();

    this.metrics.recordRefresh();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.DASHBOARD_REFRESH_COMPLETED,
      source: "DashboardAnalyticsProvider",
      payload: {
        hasSnapshot: this.snapshotView !== undefined,
        reportsCount: this.reports.length,
      },
      createdAt: new Date(),
    });
  }

  /**
   * Carrega a AnalyticsSnapshot mais recente (via o `snapshotId` do
   * AnalyticsReport mais recente) e a converte para apresentação.
   * Retorna `undefined` se nenhum AnalyticsReport existir ainda.
   */
  loadSnapshot(): DashboardSnapshotView | undefined {
    const reports = analytics.listReports();

    if (reports.length === 0) {
      return undefined;
    }

    const latestReport = [...reports].sort(
      (a, b) => b.generatedAt.getTime() - a.generatedAt.getTime(),
    )[0];

    const snapshot = analytics.getSnapshot(latestReport.snapshotId);

    if (!snapshot) {
      return undefined;
    }

    this.metrics.recordSnapshotLoaded();

    return this.toSnapshotView(snapshot);
  }

  /** Carrega todos os AnalyticsReport já criados. */
  loadReports(): AnalyticsReport[] {
    const reports = analytics.listReports();
    this.metrics.recordReportsLoaded(reports.length);

    return reports;
  }

  /** DashboardSnapshotView carregada na última `refresh()`/`loadSnapshot()`. */
  getSnapshotView(): DashboardSnapshotView | undefined {
    this.metrics.recordQuery();
    return this.snapshotView;
  }

  /** AnalyticsReport carregados na última `refresh()`/`loadReports()`. */
  getReports(): AnalyticsReport[] {
    this.metrics.recordQuery();
    return this.reports;
  }

  /** Métricas de uso do próprio DashboardAnalyticsProvider. */
  getMetrics(): DashboardAnalyticsMetricsSnapshot {
    return this.metrics.snapshot();
  }

  private toSnapshotView(snapshot: AnalyticsSnapshot): DashboardSnapshotView {
    return {
      snapshotId: snapshot.id,
      generatedAt: snapshot.generatedAt,
      metricsCount: snapshot.metrics.length,
      metrics: snapshot.metrics.map((metric) => ({
        name: metric.name,
        value: metric.value,
        source: metric.source,
      })),
    };
  }
}

/** Instância única e compartilhada do DashboardAnalyticsProvider para todo o Dashboard. */
export const dashboardAnalyticsProvider = new DashboardAnalyticsProvider();
