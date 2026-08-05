import { PageContainer } from "@shared/components/PageContainer";
import { PageHeader } from "@shared/components/PageHeader";
import { AsyncState } from "@shared/components/AsyncState";
import { useDashboardBootstrap } from "@core/query/useDashboardBootstrap";
import { CommunicationWidget } from "@/pages/dashboard/CommunicationWidget";

/** Página dedicada ao Communication Hub — reutiliza `CommunicationWidget` (FUN-001). */
export function CommunicationPage() {
  const bootstrap = useDashboardBootstrap();

  return (
    <PageContainer>
      <PageHeader title="Comunicação" description="Conversas e Mensagens, mantidas pelo Communication Hub (@abp/communication-hub)." />
      <AsyncState isLoading={bootstrap.isLoading} isError={bootstrap.isError} error={bootstrap.error} onRetry={() => void bootstrap.refetch()}>
        {bootstrap.data && <CommunicationWidget snapshot={bootstrap.data} />}
      </AsyncState>
    </PageContainer>
  );
}
