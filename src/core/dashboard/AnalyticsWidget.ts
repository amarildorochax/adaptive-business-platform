import { dashboardAnalyticsProvider } from "./DashboardAnalyticsProvider";
import { DashboardWidgetType } from "./DashboardWidgetType";
import { DashboardWidgetStatus } from "./DashboardWidgetStatus";
import type { DashboardWidget } from "./DashboardWidget";

/**
 * Monta o AnalyticsWidget (Sprint 18, Tarefa 04) — o oitavo widget do
 * Dashboard, e o único que consulta o Business Analytics. Consulta
 * exclusivamente `dashboardAnalyticsProvider` — nunca `analytics`
 * diretamente (Tarefa 04: "Nenhum widget deverá acessar Analytics
 * diretamente"), mesmo princípio já usado pelos outros sete widgets em
 * relação aos seus próprios subsistemas.
 */
export function buildAnalyticsWidget(): DashboardWidget {
  dashboardAnalyticsProvider.refresh();

  const snapshotView = dashboardAnalyticsProvider.getSnapshotView();
  const reports = dashboardAnalyticsProvider.getReports();

  return {
    id: "analytics",
    title: "Business Analytics",
    type: DashboardWidgetType.ANALYTICS,
    status: snapshotView ? DashboardWidgetStatus.OK : DashboardWidgetStatus.EMPTY,
    data: {
      snapshotId: snapshotView?.snapshotId ?? null,
      metricsCount: snapshotView?.metricsCount ?? 0,
      generatedAt: snapshotView?.generatedAt ?? null,
      reportsCount: reports.length,
    },
    updatedAt: new Date(),
  };
}
