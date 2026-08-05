import { PageContainer } from "@shared/components/PageContainer";
import { PageHeader } from "@shared/components/PageHeader";
import { AsyncState } from "@shared/components/AsyncState";
import { useDashboardBootstrap } from "@core/query/useDashboardBootstrap";
import { AutomationWidget } from "@/pages/dashboard/AutomationWidget";

/** Página dedicada ao Automation Engine — reutiliza `AutomationWidget` (FUN-001). */
export function AutomationPage() {
  const bootstrap = useDashboardBootstrap();

  return (
    <PageContainer>
      <PageHeader title="Automação" description="Workflows e Execuções, mantidos pelo Automation Engine (@abp/automation-engine)." />
      <AsyncState isLoading={bootstrap.isLoading} isError={bootstrap.isError} error={bootstrap.error} onRetry={() => void bootstrap.refetch()}>
        {bootstrap.data && <AutomationWidget snapshot={bootstrap.data} />}
      </AsyncState>
    </PageContainer>
  );
}
