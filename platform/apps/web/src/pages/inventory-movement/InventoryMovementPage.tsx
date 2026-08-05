import { ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@shared/components/PageContainer";
import { PageHeader } from "@shared/components/PageHeader";
import { AsyncState } from "@shared/components/AsyncState";
import { Button } from "@shared/components/ui/Button";
import { SectionSubNav } from "@shared/components/ui/SectionSubNav";
import { useAuth } from "@core/auth/useAuth";
import { useActiveStockLocations } from "@core/inventory-movement/useActiveStockLocations";
import { CreateStockMovementDrawer } from "./CreateStockMovementDrawer";
import { useInventoryMovementHistoryLog } from "./inventoryMovementHistoryLog";
import { AlertsSection } from "./sections/AlertsSection";
import { AnalyticsSection } from "./sections/AnalyticsSection";
import { HistorySection } from "./sections/HistorySection";
import { LocationsSection } from "./sections/LocationsSection";
import { MovementsSection } from "./sections/MovementsSection";
import { OverviewSection } from "./sections/OverviewSection";
import { PositionsSection } from "./sections/PositionsSection";
import { ReservationsSection } from "./sections/ReservationsSection";
import { SettingsSection } from "./sections/SettingsSection";
import { DEFAULT_INVENTORY_MOVEMENT_SECTION, INVENTORY_MOVEMENT_SECTIONS, isInventoryMovementSectionId, type InventoryMovementSectionId } from "./inventoryMovementSections";

/**
 * Inventory Movement Workspace (IMP-405) — a quinta e última etapa do Inventory Movement Hub,
 * encerrando o ciclo Arquitetura → Core → Persistência → HTTP API → Frontend Infrastructure →
 * Workspace (ERP-001, IMP-401 a IMP-405), o terceiro domínio ERP completo desta plataforma (após
 * Supplier Hub e Purchase Hub). Organizado em nove seções (`inventoryMovementSections.ts`) navegáveis
 * pela mesma barra lateral contextual genérica (`SectionSubNav`) já usada por todo Workspace desta
 * série.
 *
 * **Rota nova (`/inventory-movement`), nunca uma substituição de `/inventory` (FUN-105)** — achado
 * real de auditoria (Passo 1), divergindo deliberadamente do precedente de IMP-305 (que substituiu
 * `/purchases` por completo): `/inventory` já é uma lente real sobre `CommerceManager`/
 * `useProductWorkspace()` (Inventário/Movimentações/Disponibilidade/Composições/Alertas de Produto),
 * cujo escopo é apenas parcialmente sobreposto ao Inventory Movement Hub — "Composições" pertence
 * inteiramente a um futuro Production Hub, sem nenhuma relação com este domínio; a reconciliação
 * formal entre a projeção simplificada de `Inventory` (Commerce Hub) e o ledger real deste Hub
 * permanece um Change Request proposto e nunca executado (`INVENTORY_MOVEMENT_HUB.md`, ADR-IM-001,
 * já citado desde IMP-401) — substituir `/inventory` agora seria executar essa reconciliação
 * silenciosamente, exatamente o que STD-001 proíbe. Documentado em
 * `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`, "Divergências Encontradas".
 *
 * Toda comunicação acontece exclusivamente através de `core/inventory-movement/` (IMP-404) — nenhuma
 * seção importa `ApiClient`, chama `fetch`, ou acessa `InventoryMovementManager` diretamente.
 * `useAuth().tenantId`, nunca `useDashboardBootstrap()` — mesma decisão consciente já tomada por
 * Supplier/Purchase Workspace.
 *
 * `useActiveStockLocations(tenantId)` é a única Query de topo — **achado central desta Sprint**:
 * diferente de Supplier Hub (`useSuppliers`) e Purchase Hub (`usePurchaseOrders`), o Inventory
 * Movement Hub não expõe nenhuma Query tenant-wide para Stock Movement ou Stock Reservation — toda
 * consulta exige um `productId`/`originReferenceId`/`reservationId`/`orderId` já conhecido. A única
 * exceção genuinamente tenant-wide é `listActiveStockLocations`, por isso ela ocupa o lugar estrutural
 * que `usePurchaseOrders`/`useSuppliers` ocupavam nos Workspaces anteriores. Documentado em
 * `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`, "Limitações".
 */
export function InventoryMovementPage() {
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const historyLog = useInventoryMovementHistoryLog();
  const [isCreateMovementOpen, setIsCreateMovementOpen] = useState(false);

  const tenantId = auth.tenantId;
  const activeLocations = useActiveStockLocations(tenantId);

  const sectionParam = searchParams.get("section");
  const activeSection: InventoryMovementSectionId = isInventoryMovementSectionId(sectionParam) ? sectionParam : DEFAULT_INVENTORY_MOVEMENT_SECTION;

  function selectSection(id: InventoryMovementSectionId) {
    setSearchParams(id === DEFAULT_INVENTORY_MOVEMENT_SECTION ? {} : { section: id });
  }

  const isLoading = tenantId === undefined || activeLocations.isLoading;
  const isError = activeLocations.isError;

  return (
    <PageContainer>
      <PageHeader
        title="Movimentação de Estoque"
        description="O Inventory Movement Workspace — o ledger físico imutável da Adaptive, consumido exclusivamente via HTTP real (ERP Foundation)."
        actions={
          tenantId && (
            <Button type="button" variant="primary" leadingIcon={<ArrowRightLeft size={16} aria-hidden="true" />} onClick={() => setIsCreateMovementOpen(true)}>
              Nova Movimentação
            </Button>
          )
        }
      />
      <AsyncState isLoading={isLoading} isError={isError} error={activeLocations.error} onRetry={() => void activeLocations.refetch()}>
        {tenantId && activeLocations.data && (
          <div className="profile-layout">
            <SectionSubNav label="Seções do Inventory Movement Workspace" sections={INVENTORY_MOVEMENT_SECTIONS} activeId={activeSection} onSelect={selectSection} />
            <div className="profile-content">
              {activeSection === "overview" && (
                <OverviewSection
                  activeLocationsCount={activeLocations.data.length}
                  dataUpdatedAt={activeLocations.dataUpdatedAt}
                  movementsThisSession={historyLog.movements}
                  reservationsThisSession={historyLog.reservations}
                />
              )}
              {activeSection === "movements" && <MovementsSection onLogged={historyLog.append} />}
              {activeSection === "positions" && <PositionsSection />}
              {activeSection === "reservations" && (
                <ReservationsSection tenantId={tenantId} onLogged={historyLog.append} onReservationChanged={historyLog.upsertReservation} />
              )}
              {activeSection === "locations" && <LocationsSection tenantId={tenantId} activeLocations={activeLocations.data} onLogged={historyLog.append} />}
              {activeSection === "alerts" && <AlertsSection tenantId={tenantId} onLogged={historyLog.append} />}
              {activeSection === "history" && <HistorySection log={historyLog.entries} />}
              {activeSection === "analytics" && <AnalyticsSection movementsThisSession={historyLog.movements} reservationsThisSession={historyLog.reservations} activeLocationsCount={activeLocations.data.length} />}
              {activeSection === "settings" && <SettingsSection />}
            </div>
          </div>
        )}
      </AsyncState>

      {tenantId && (
        <CreateStockMovementDrawer
          open={isCreateMovementOpen}
          onClose={() => setIsCreateMovementOpen(false)}
          tenantId={tenantId}
          onRegistered={(result) => {
            historyLog.recordMovement(result.movement);
            historyLog.append(`Movimentação ${result.movement.movementId.slice(0, 8)} registrada — ${result.movement.quantityDelta > 0 ? "+" : ""}${result.movement.quantityDelta} un. (${result.movement.origin}).`);
            if (activeSection !== "movements" && activeSection !== "overview") {
              selectSection("movements");
            }
          }}
        />
      )}
    </PageContainer>
  );
}
