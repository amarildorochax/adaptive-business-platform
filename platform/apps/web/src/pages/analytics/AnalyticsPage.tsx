import { PageContainer } from "@shared/components/PageContainer";
import { PageHeader } from "@shared/components/PageHeader";
import { AsyncState } from "@shared/components/AsyncState";
import { StatCard } from "@shared/components/StatCard";
import { useDashboardBootstrap } from "@core/query/useDashboardBootstrap";
import { AnalyticsWidget } from "@/pages/dashboard/AnalyticsWidget";

/** Página dedicada ao Analytics Hub — reutiliza `AnalyticsWidget` (FUN-001). */
export function AnalyticsPage() {
  const bootstrap = useDashboardBootstrap();

  return (
    <PageContainer>
      <PageHeader title="Analytics" description="Métricas, KPIs e Dashboards, mantidos pelo Analytics Hub (@abp/analytics-hub)." />
      <AsyncState isLoading={bootstrap.isLoading} isError={bootstrap.isError} error={bootstrap.error} onRetry={() => void bootstrap.refetch()}>
        {bootstrap.data && (
          <>
            <AnalyticsWidget snapshot={bootstrap.data} />
            <StatCard label="KPI consolidado" value={bootstrap.data.kpi.value.toLocaleString("pt-BR")} />
          </>
        )}
      </AsyncState>
    </PageContainer>
  );
}
