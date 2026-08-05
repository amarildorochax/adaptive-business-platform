import { Factory } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@shared/components/PageContainer";
import { PageHeader } from "@shared/components/PageHeader";
import { AsyncState } from "@shared/components/AsyncState";
import { Button } from "@shared/components/ui/Button";
import { SectionSubNav } from "@shared/components/ui/SectionSubNav";
import { useAuth } from "@core/auth/useAuth";
import { useActiveWorkCenters } from "@core/production/useActiveWorkCenters";
import { CreateProductionOrderDrawer } from "./CreateProductionOrderDrawer";
import { useProductionHistoryLog } from "./productionHistoryLog";
import { DEFAULT_PRODUCTION_SECTION, PRODUCTION_SECTIONS, isProductionSectionId, type ProductionSectionId } from "./productionSections";
import { AnalyticsSection } from "./sections/AnalyticsSection";
import { BOMSection } from "./sections/BOMSection";
import { HistorySection } from "./sections/HistorySection";
import { InProgressSection } from "./sections/InProgressSection";
import { OrdersSection } from "./sections/OrdersSection";
import { OverviewSection } from "./sections/OverviewSection";
import { SettingsSection } from "./sections/SettingsSection";
import { WorkCentersSection } from "./sections/WorkCentersSection";

/**
 * Production Workspace (IMP-505) — a quinta e última etapa do Production Hub, encerrando o ciclo
 * Arquitetura → Core → Persistência → HTTP API → Frontend Infrastructure → Workspace (ERP-001,
 * IMP-501 a IMP-505), o quarto domínio ERP completo desta plataforma (após Supplier Hub, Purchase Hub
 * e Inventory Movement Hub). Organizado em oito seções (`productionSections.ts`) navegáveis pela mesma
 * barra lateral contextual genérica (`SectionSubNav`) já usada por todo Workspace desta série.
 *
 * Toda comunicação acontece exclusivamente através de `core/production/` (IMP-504) — nenhuma seção
 * importa `ApiClient`, chama `fetch`, ou acessa `ProductionManager` diretamente. `useAuth().tenantId`,
 * nunca `useDashboardBootstrap()` — mesma decisão consciente já tomada por Supplier/Purchase/Inventory
 * Movement Workspace.
 *
 * `useActiveWorkCenters()` é a única Query de topo — **achado central desta Sprint, mesma classe já
 * documentada por `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`**: o Production Hub não expõe
 * nenhuma Query tenant-wide para `ProductionOrder`/`BillOfMaterials` — toda consulta exige um
 * identificador/status/origem já conhecido. A única exceção genuinamente próxima de tenant-wide é
 * `listActiveWorkCenters()` — e mesmo essa não recebe `tenantId` no próprio endpoint (limitação
 * herdada do Core/Persistência/HTTP, IMP-501/502/503, nunca resolvida silenciosamente aqui). Ocupa,
 * ainda assim, o lugar estrutural que `useActiveStockLocations`/`usePurchaseOrders`/`useSuppliers`
 * ocupavam nos Workspaces anteriores.
 */
export function ProductionPage() {
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const historyLog = useProductionHistoryLog();
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  const tenantId = auth.tenantId;
  const activeWorkCenters = useActiveWorkCenters();

  const sectionParam = searchParams.get("section");
  const activeSection: ProductionSectionId = isProductionSectionId(sectionParam) ? sectionParam : DEFAULT_PRODUCTION_SECTION;

  function selectSection(id: ProductionSectionId) {
    setSearchParams(id === DEFAULT_PRODUCTION_SECTION ? {} : { section: id });
  }

  const isLoading = tenantId === undefined || activeWorkCenters.isLoading;
  const isError = activeWorkCenters.isError;

  return (
    <PageContainer>
      <PageHeader
        title="Produção"
        description="O Production Workspace — transformação de insumo em Produto acabado, consumido exclusivamente via HTTP real (ERP Foundation)."
        actions={
          tenantId && (
            <Button type="button" variant="primary" leadingIcon={<Factory size={16} aria-hidden="true" />} onClick={() => setIsCreateOrderOpen(true)}>
              Nova Ordem de Produção
            </Button>
          )
        }
      />
      <AsyncState isLoading={isLoading} isError={isError} error={activeWorkCenters.error} onRetry={() => void activeWorkCenters.refetch()}>
        {tenantId && activeWorkCenters.data && (
          <div className="profile-layout">
            <SectionSubNav label="Seções do Production Workspace" sections={PRODUCTION_SECTIONS} activeId={activeSection} onSelect={selectSection} />
            <div className="profile-content">
              {activeSection === "overview" && (
                <OverviewSection
                  activeWorkCentersCount={activeWorkCenters.data.length}
                  dataUpdatedAt={activeWorkCenters.dataUpdatedAt}
                  productionOrdersThisSession={historyLog.productionOrders}
                />
              )}
              {activeSection === "orders" && <OrdersSection productionOrdersThisSession={historyLog.productionOrders} />}
              {activeSection === "in-progress" && <InProgressSection onLogged={historyLog.append} onOrderChanged={historyLog.upsertProductionOrder} />}
              {activeSection === "work-centers" && <WorkCentersSection tenantId={tenantId} activeWorkCenters={activeWorkCenters.data} onLogged={historyLog.append} />}
              {activeSection === "bom" && <BOMSection tenantId={tenantId} onLogged={historyLog.append} />}
              {activeSection === "history" && <HistorySection log={historyLog.entries} />}
              {activeSection === "analytics" && <AnalyticsSection productionOrdersThisSession={historyLog.productionOrders} />}
              {activeSection === "settings" && <SettingsSection />}
            </div>
          </div>
        )}
      </AsyncState>

      {tenantId && (
        <CreateProductionOrderDrawer
          open={isCreateOrderOpen}
          onClose={() => setIsCreateOrderOpen(false)}
          tenantId={tenantId}
          onCreated={(order) => {
            historyLog.upsertProductionOrder(order);
            historyLog.append(`Ordem ${order.productionOrderId.slice(0, 8)} criada — Composição ${order.billOfMaterialsId.slice(0, 8)}, planejado ${order.plannedOutputQuantity}.`);
            if (activeSection !== "orders" && activeSection !== "overview") {
              selectSection("orders");
            }
          }}
        />
      )}
    </PageContainer>
  );
}
