import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@shared/components/PageContainer";
import { PageHeader } from "@shared/components/PageHeader";
import { AsyncState } from "@shared/components/AsyncState";
import { useAuth } from "@core/auth/useAuth";
import { useDashboardBootstrap } from "@core/query/useDashboardBootstrap";
import { useProductWorkspace } from "@core/query/useProductWorkspace";
import { SectionSubNav } from "@shared/components/ui/SectionSubNav";
import { DEFAULT_PRODUCT_HUB_SECTION, isProductHubSectionId, PRODUCT_HUB_SECTIONS, type ProductHubSectionId } from "./productHubSections";
import { AnalyticsSection } from "./sections/AnalyticsSection";
import { CatalogSection } from "./sections/CatalogSection";
import { CategoriesSection } from "./sections/CategoriesSection";
import { CompositionsSection } from "./sections/CompositionsSection";
import { CostsSection } from "./sections/CostsSection";
import { HistorySection } from "./sections/HistorySection";
import { OverviewSection } from "./sections/OverviewSection";
import { PricingSection } from "./sections/PricingSection";
import { PurchasesSection } from "./sections/PurchasesSection";
import { SettingsSection } from "./sections/SettingsSection";
import { StockSection } from "./sections/StockSection";

/**
 * Product Hub Workspace (FUN-104) — o primeiro Product Hub da plataforma, organizado em onze seções
 * (`productHubSections.ts`) navegáveis pela mesma barra lateral contextual genérica (`SectionSubNav`)
 * já usada por Perfil Empresarial (FUN-101), Branding (FUN-102) e CRM (FUN-103). Auditoria completa
 * do `CommerceManager` (dezoito métodos públicos, todos de escrita — zero Query de listagem, mesma
 * limitação central já documentada para `CRMManager`) em
 * `docs/implementation/FUN_104_PRODUCT_HUB_WORKSPACE_REPORT.md`. Diferente de CRM/Branding/Business
 * Profile, o Commerce Hub nunca ganhou nenhuma rota HTTP em `apps/api` — este Sprint conecta
 * `CommerceManager` em processo (`core/managers/buildManagers.ts`), mesmo padrão já em uso desde a
 * FUN-001 para Communication/Analytics/Automation/Knowledge, nenhum Manager/Service/Repository
 * Interface novo. Modelagem inteiramente genérica (Product/Category/Catalog/Price/Inventory) —
 * nenhum campo específico de floricultura, serve qualquer segmento.
 */
export function ProductHubPage() {
  const auth = useAuth();
  const bootstrap = useDashboardBootstrap();
  const workspace = useProductWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();

  const sectionParam = searchParams.get("section");
  const activeSection: ProductHubSectionId = isProductHubSectionId(sectionParam) ? sectionParam : DEFAULT_PRODUCT_HUB_SECTION;

  function selectSection(id: ProductHubSectionId) {
    setSearchParams(id === DEFAULT_PRODUCT_HUB_SECTION ? {} : { section: id });
  }

  const isLoading = bootstrap.isLoading || workspace.isLoading;
  const isError = bootstrap.isError || workspace.isError;

  return (
    <PageContainer>
      <PageHeader title="Produtos" description="O Product Hub — Catálogo, Categorias, Estoque e Precificação, o início da gestão de produtos da Empresa, pronto para servir qualquer segmento." />
      <AsyncState isLoading={isLoading} isError={isError} error={bootstrap.error ?? workspace.error} onRetry={() => { void bootstrap.refetch(); void workspace.refetch(); }}>
        {bootstrap.data && workspace.data && (
          <div className="profile-layout">
            <SectionSubNav label="Seções do Product Hub" sections={PRODUCT_HUB_SECTIONS} activeId={activeSection} onSelect={selectSection} />
            <div className="profile-content">
              {activeSection === "overview" && <OverviewSection workspace={workspace.data} profileId={bootstrap.data.profileId} tenantId={auth.tenantId ?? bootstrap.data.tenantId} />}
              {activeSection === "catalog" && <CatalogSection workspace={workspace.data} tenantId={auth.tenantId ?? bootstrap.data.tenantId} />}
              {activeSection === "categories" && <CategoriesSection workspace={workspace.data} tenantId={auth.tenantId ?? bootstrap.data.tenantId} />}
              {activeSection === "compositions" && <CompositionsSection />}
              {activeSection === "stock" && <StockSection workspace={workspace.data} />}
              {activeSection === "purchases" && <PurchasesSection />}
              {activeSection === "costs" && <CostsSection workspace={workspace.data} />}
              {activeSection === "pricing" && <PricingSection workspace={workspace.data} />}
              {activeSection === "history" && <HistorySection workspace={workspace.data} />}
              {activeSection === "analytics" && <AnalyticsSection workspace={workspace.data} />}
              {activeSection === "settings" && <SettingsSection />}
            </div>
          </div>
        )}
      </AsyncState>
    </PageContainer>
  );
}
