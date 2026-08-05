import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@shared/components/PageContainer";
import { PageHeader } from "@shared/components/PageHeader";
import { AsyncState } from "@shared/components/AsyncState";
import { useAuth } from "@core/auth/useAuth";
import { useDashboardBootstrap } from "@core/query/useDashboardBootstrap";
import { useProductWorkspace } from "@core/query/useProductWorkspace";
import { SectionSubNav } from "@shared/components/ui/SectionSubNav";
import { SettingsSection as ProductHubSettingsSection } from "@/pages/product-hub/sections/SettingsSection";
import { HistorySection as ProductHubHistorySection } from "@/pages/product-hub/sections/HistorySection";
import { DEFAULT_INVENTORY_SECTION, INVENTORY_SECTIONS, isInventorySectionId, type InventorySectionId } from "./inventorySections";
import { AlertsSection } from "./sections/AlertsSection";
import { AnalyticsSection } from "./sections/AnalyticsSection";
import { AvailabilitySection } from "./sections/AvailabilitySection";
import { CompositionsSection } from "./sections/CompositionsSection";
import { InventoryListSection } from "./sections/InventoryListSection";
import { MovementsSection } from "./sections/MovementsSection";
import { OverviewSection } from "./sections/OverviewSection";
import { ReservationsSection } from "./sections/ReservationsSection";

/**
 * Inventory Workspace (FUN-105) — o núcleo operacional de estoque da plataforma, organizado em dez
 * seções (`inventorySections.ts`) navegáveis pela mesma barra lateral contextual genérica
 * (`SectionSubNav`) já usada por Perfil Empresarial (FUN-101), Branding (FUN-102), CRM (FUN-103) e
 * Product Hub (FUN-104). Auditoria completa do `CommerceManager` focada em Inventory/Stock/Movement/
 * Composition documentada em `docs/implementation/FUN_105_INVENTORY_WORKSPACE_REPORT.md`: nenhum
 * Manager/Service/Repository novo foi criado — este Workspace é uma nova lente operacional sobre o
 * mesmo Product Hub Workspace já conectado em processo desde a FUN-104 (`useProductWorkspace`, o
 * mesmo cache `["commerce","workspace"]`), nunca uma segunda fonte de verdade. Histórico e
 * Configurações reutilizam, sem duplicar, os componentes de seção já construídos pela FUN-104
 * (`pages/product-hub/sections/HistorySection`/`SettingsSection`) — ambos já genéricos o bastante.
 */
export function InventoryPage() {
  const auth = useAuth();
  const bootstrap = useDashboardBootstrap();
  const workspace = useProductWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();

  const sectionParam = searchParams.get("section");
  const activeSection: InventorySectionId = isInventorySectionId(sectionParam) ? sectionParam : DEFAULT_INVENTORY_SECTION;

  function selectSection(id: InventorySectionId) {
    setSearchParams(id === DEFAULT_INVENTORY_SECTION ? {} : { section: id });
  }

  const isLoading = bootstrap.isLoading || workspace.isLoading;
  const isError = bootstrap.isError || workspace.isError;

  return (
    <PageContainer>
      <PageHeader title="Estoque" description="O Inventory Workspace — o núcleo operacional de estoque, preparado para integrar Compras, Produção, Financeiro, Fiscal e Analytics." />
      <AsyncState isLoading={isLoading} isError={isError} error={bootstrap.error ?? workspace.error} onRetry={() => { void bootstrap.refetch(); void workspace.refetch(); }}>
        {bootstrap.data && workspace.data && (
          <div className="profile-layout">
            <SectionSubNav label="Seções do Inventory Workspace" sections={INVENTORY_SECTIONS} activeId={activeSection} onSelect={selectSection} />
            <div className="profile-content">
              {activeSection === "overview" && <OverviewSection workspace={workspace.data} profileId={bootstrap.data.profileId} tenantId={auth.tenantId ?? bootstrap.data.tenantId} />}
              {activeSection === "inventory" && <InventoryListSection workspace={workspace.data} />}
              {activeSection === "movements" && <MovementsSection workspace={workspace.data} />}
              {activeSection === "availability" && <AvailabilitySection workspace={workspace.data} />}
              {activeSection === "reservations" && <ReservationsSection />}
              {activeSection === "compositions" && <CompositionsSection workspace={workspace.data} />}
              {activeSection === "alerts" && <AlertsSection workspace={workspace.data} />}
              {activeSection === "history" && <ProductHubHistorySection workspace={workspace.data} />}
              {activeSection === "analytics" && <AnalyticsSection workspace={workspace.data} />}
              {activeSection === "settings" && <ProductHubSettingsSection />}
            </div>
          </div>
        )}
      </AsyncState>
    </PageContainer>
  );
}
