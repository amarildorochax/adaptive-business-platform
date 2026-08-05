import { ClipboardList, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@shared/components/PageContainer";
import { PageHeader } from "@shared/components/PageHeader";
import { AsyncState } from "@shared/components/AsyncState";
import { Button } from "@shared/components/ui/Button";
import { SectionSubNav } from "@shared/components/ui/SectionSubNav";
import { useAuth } from "@core/auth/useAuth";
import { usePurchaseOrders } from "@core/purchase/usePurchaseOrders";
import { CreatePurchaseOrderDrawer } from "./CreatePurchaseOrderDrawer";
import { CreatePurchaseRequisitionDrawer } from "./CreatePurchaseRequisitionDrawer";
import { usePurchaseHistoryLog } from "./purchaseHistoryLog";
import { AnalyticsSection } from "./sections/AnalyticsSection";
import { HistorySection } from "./sections/HistorySection";
import { OrdersSection } from "./sections/OrdersSection";
import { OverviewSection } from "./sections/OverviewSection";
import { ReceivingsSection } from "./sections/ReceivingsSection";
import { RequisitionsSection } from "./sections/RequisitionsSection";
import { ReorderSection } from "./sections/ReorderSection";
import { SettingsSection } from "./sections/SettingsSection";
import { DEFAULT_PURCHASE_SECTION, isPurchaseSectionId, PURCHASE_SECTIONS, type PurchaseSectionId } from "./purchaseSections";

/**
 * Purchase Workspace (IMP-305) — a quinta e última etapa do Purchase Hub, encerrando o ciclo
 * Arquitetura → Core → Persistência → HTTP API → Frontend Infrastructure → Workspace (ERP-001,
 * IMP-301 a IMP-305), o segundo domínio ERP completo desta plataforma. Organizado em oito seções
 * (`purchaseSections.ts`) navegáveis pela mesma barra lateral contextual genérica (`SectionSubNav`)
 * já usada pelo Supplier Workspace (IMP-205).
 *
 * **Substitui integralmente o placeholder de FUN-106** (`pages/purchases/*` antigo, removido nesta
 * Sprint) — achado real de auditoria (Passo 1): a rota `/purchases` já existia, apontando para um
 * Workspace inteiramente fictício sobre `useProductWorkspace()`/`CommerceManager` em processo
 * (nenhuma relação com `@abp/purchase-hub`). Documentado em `IMP_305_PURCHASE_WORKSPACE_REPORT.md`,
 * "Divergências Encontradas" — nunca corrigido silenciosamente: a substituição é a consequência
 * direta e pretendida de todo o ciclo ERP-001→IMP-301..305 (o próprio FUN-106 já documentava, à
 * época, que nenhum Purchase Hub real existia ainda). `pages/product-hub/sections/PurchasesSection.tsx`
 * (aba "Compras" do Product Hub Workspace, um conceito distinto — a ausência do lado de compra
 * dentro do Commerce Hub) permanece intocado, por ser uma lacuna genuinamente diferente.
 *
 * Toda comunicação acontece exclusivamente através de `core/purchase/` (IMP-304) — nenhuma seção
 * importa `ApiClient`, chama `fetch`, ou acessa `PurchaseManager` diretamente. `useAuth().tenantId`,
 * nunca `useDashboardBootstrap()` — mesma decisão consciente já tomada pelo Supplier Workspace
 * (IMP-205): o Purchase Hub é 100% HTTP real desde o Core (IMP-301), sem nenhuma relação com o
 * Business Profile Engine ou com qualquer Manager em processo.
 *
 * `usePurchaseOrders(tenantId)` é a única Query de topo — diferente do Supplier Workspace (uma única
 * Query cobria tudo), o Purchase Hub expõe seis Queries reais; cada seção que precisa de uma Query
 * adicional (`usePurchaseRequisitions`/`useReceivings`) a chama diretamente, co-localizada, nunca uma
 * segunda instância de `usePurchaseOrders`. Decisão documentada em
 * `IMP_305_PURCHASE_WORKSPACE_REPORT.md`, "Arquitetura Utilizada".
 */
export function PurchasePage() {
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const historyLog = usePurchaseHistoryLog();
  const [isCreateRequisitionOpen, setIsCreateRequisitionOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  const tenantId = auth.tenantId;
  const openOrders = usePurchaseOrders(tenantId);

  const sectionParam = searchParams.get("section");
  const activeSection: PurchaseSectionId = isPurchaseSectionId(sectionParam) ? sectionParam : DEFAULT_PURCHASE_SECTION;

  function selectSection(id: PurchaseSectionId) {
    setSearchParams(id === DEFAULT_PURCHASE_SECTION ? {} : { section: id });
  }

  const isLoading = tenantId === undefined || openOrders.isLoading;
  const isError = openOrders.isError;

  return (
    <PageContainer>
      <PageHeader
        title="Compras"
        description="O Purchase Workspace — Requisições, Pedidos, Recebimentos e Reposição, consumidos exclusivamente via HTTP real (ERP Foundation)."
        actions={
          tenantId && (
            <div style={{ display: "flex", gap: 8 }}>
              <Button type="button" variant="secondary" leadingIcon={<ClipboardList size={16} aria-hidden="true" />} onClick={() => setIsCreateRequisitionOpen(true)}>
                Nova Requisição
              </Button>
              <Button type="button" variant="primary" leadingIcon={<ShoppingCart size={16} aria-hidden="true" />} onClick={() => setIsCreateOrderOpen(true)}>
                Novo Pedido
              </Button>
            </div>
          )
        }
      />
      <AsyncState isLoading={isLoading} isError={isError} error={openOrders.error} onRetry={() => void openOrders.refetch()}>
        {tenantId && openOrders.data && (
          <div className="profile-layout">
            <SectionSubNav label="Seções do Purchase Workspace" sections={PURCHASE_SECTIONS} activeId={activeSection} onSelect={selectSection} />
            <div className="profile-content">
              {activeSection === "overview" && <OverviewSection tenantId={tenantId} openOrders={openOrders.data} dataUpdatedAt={openOrders.dataUpdatedAt} receivedThisSession={historyLog.receivedThisSession} />}
              {activeSection === "requisitions" && <RequisitionsSection tenantId={tenantId} onCreateRequested={() => setIsCreateRequisitionOpen(true)} onLogged={historyLog.append} />}
              {activeSection === "orders" && <OrdersSection purchaseOrders={openOrders.data} onCreateRequested={() => setIsCreateOrderOpen(true)} onLogged={historyLog.append} />}
              {activeSection === "receivings" && <ReceivingsSection purchaseOrders={openOrders.data} onFullyReceived={historyLog.markReceived} onLogged={historyLog.append} />}
              {activeSection === "reorder" && <ReorderSection tenantId={tenantId} onLogged={historyLog.append} />}
              {activeSection === "history" && <HistorySection log={historyLog.entries} />}
              {activeSection === "analytics" && <AnalyticsSection purchaseOrders={openOrders.data} />}
              {activeSection === "settings" && <SettingsSection />}
            </div>
          </div>
        )}
      </AsyncState>

      {tenantId && (
        <>
          <CreatePurchaseRequisitionDrawer
            open={isCreateRequisitionOpen}
            onClose={() => setIsCreateRequisitionOpen(false)}
            tenantId={tenantId}
            onCreated={(requisition) => {
              historyLog.append(`Requisição ${requisition.requisitionId.slice(0, 8)} criada.`);
              if (activeSection !== "requisitions" && activeSection !== "overview") {
                selectSection("requisitions");
              }
            }}
          />
          <CreatePurchaseOrderDrawer
            open={isCreateOrderOpen}
            onClose={() => setIsCreateOrderOpen(false)}
            tenantId={tenantId}
            onCreated={(purchaseOrder) => {
              historyLog.append(`Pedido ${purchaseOrder.purchaseOrderId.slice(0, 8)} criado.`);
              if (activeSection !== "orders" && activeSection !== "overview") {
                selectSection("orders");
              }
            }}
          />
        </>
      )}
    </PageContainer>
  );
}
