import { PageContainer } from "@shared/components/PageContainer";
import { PageHeader } from "@shared/components/PageHeader";
import { AsyncState } from "@shared/components/AsyncState";
import { useDashboardBootstrap } from "@core/query/useDashboardBootstrap";
import { KnowledgeWidget } from "@/pages/dashboard/KnowledgeWidget";

/** Página dedicada ao Knowledge Hub — reutiliza `KnowledgeWidget` (FUN-001). */
export function KnowledgePage() {
  const bootstrap = useDashboardBootstrap();

  return (
    <PageContainer>
      <PageHeader title="Conhecimento" description="Base de Conhecimento, mantida pelo Knowledge Hub (@abp/platform-services)." />
      <AsyncState isLoading={bootstrap.isLoading} isError={bootstrap.isError} error={bootstrap.error} onRetry={() => void bootstrap.refetch()}>
        {bootstrap.data && <KnowledgeWidget snapshot={bootstrap.data} />}
      </AsyncState>
    </PageContainer>
  );
}
