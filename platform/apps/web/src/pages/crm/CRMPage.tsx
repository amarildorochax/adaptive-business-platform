import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@shared/components/PageContainer";
import { PageHeader } from "@shared/components/PageHeader";
import { AsyncState } from "@shared/components/AsyncState";
import { useAuth } from "@core/auth/useAuth";
import { useDashboardBootstrap } from "@core/query/useDashboardBootstrap";
import { useCrmWorkspace } from "@core/query/useCrmWorkspace";
import { SectionSubNav } from "@shared/components/ui/SectionSubNav";
import { CRM_SECTIONS, DEFAULT_CRM_SECTION, isCrmSectionId, type CrmSectionId } from "./crmSections";
import { ActivitiesSection } from "./sections/ActivitiesSection";
import { CustomersSection } from "./sections/CustomersSection";
import { InsightsSection } from "./sections/InsightsSection";
import { OpportunitiesSection } from "./sections/OpportunitiesSection";
import { OverviewSection } from "./sections/OverviewSection";
import { PipelineSection } from "./sections/PipelineSection";
import { ReportsSection } from "./sections/ReportsSection";
import { SettingsSection } from "./sections/SettingsSection";
import { TimelineSection } from "./sections/TimelineSection";

/**
 * CRM Workspace (FUN-103) — o centro da operação comercial, organizado em nove seções
 * (`crmSections.ts`) navegáveis pela mesma barra lateral contextual genérica (`SectionSubNav`) já
 * usada por Perfil Empresarial (FUN-101) e Branding (FUN-102), a seção ativa refletida na URL
 * (`?section=`). Auditoria completa do `CRMManager` (oito métodos públicos, todos de escrita — zero
 * Query de listagem) documentada em `docs/implementation/FUN_103_CRM_WORKSPACE_REPORT.md`: toda
 * lista/Kanban/Timeline desta experiência é reconstruída a partir do CRM Workspace acumulado
 * localmente nesta sessão (`useCrmWorkspace`), nunca de uma consulta real ao servidor — a limitação
 * central desta Sprint, explicada em detalhe no relatório.
 */
export function CRMPage() {
  const auth = useAuth();
  const bootstrap = useDashboardBootstrap();
  const workspace = useCrmWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();

  const sectionParam = searchParams.get("section");
  const activeSection: CrmSectionId = isCrmSectionId(sectionParam) ? sectionParam : DEFAULT_CRM_SECTION;

  function selectSection(id: CrmSectionId) {
    setSearchParams(id === DEFAULT_CRM_SECTION ? {} : { section: id });
  }

  const isLoading = bootstrap.isLoading || workspace.isLoading;
  const isError = bootstrap.isError || workspace.isError;

  return (
    <PageContainer>
      <PageHeader title="CRM" description="O Workspace Comercial — Leads, Clientes, Oportunidades e Pipeline, mantidos pelo CRM Hub e consumidos por toda a operação comercial." />
      <AsyncState isLoading={isLoading} isError={isError} error={bootstrap.error ?? workspace.error} onRetry={() => { void bootstrap.refetch(); void workspace.refetch(); }}>
        {bootstrap.data && workspace.data && (
          <div className="profile-layout">
            <SectionSubNav label="Seções do CRM Workspace" sections={CRM_SECTIONS} activeId={activeSection} onSelect={selectSection} />
            <div className="profile-content">
              {activeSection === "overview" && <OverviewSection workspace={workspace.data} profileId={bootstrap.data.profileId} tenantId={auth.tenantId ?? bootstrap.data.tenantId} dataUpdatedAt={workspace.dataUpdatedAt} />}
              {activeSection === "pipeline" && <PipelineSection workspace={workspace.data} />}
              {activeSection === "opportunities" && <OpportunitiesSection workspace={workspace.data} tenantId={auth.tenantId ?? bootstrap.data.tenantId} />}
              {activeSection === "customers" && <CustomersSection workspace={workspace.data} tenantId={auth.tenantId ?? bootstrap.data.tenantId} />}
              {activeSection === "activities" && <ActivitiesSection />}
              {activeSection === "timeline" && <TimelineSection workspace={workspace.data} />}
              {activeSection === "insights" && <InsightsSection workspace={workspace.data} />}
              {activeSection === "reports" && <ReportsSection workspace={workspace.data} />}
              {activeSection === "settings" && <SettingsSection />}
            </div>
          </div>
        )}
      </AsyncState>
    </PageContainer>
  );
}
