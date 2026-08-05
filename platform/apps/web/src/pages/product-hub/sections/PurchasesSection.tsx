import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";

/**
 * Compras (FUN-104) — inteiramente placeholder. `packages/commerce-hub` não modela nenhum conceito
 * do lado de aquisição/fornecimento (nenhum PurchaseOrder, nenhuma Entidade de compra) — `Supplier`
 * existe apenas como tipo catalogado em `CRM_HUB.md`, sem nenhum `SupplierManager` implementado (ver
 * relatório da FUN-103), e nada equivalente existe no Commerce Hub. Nenhuma persistência inventada.
 */
export function PurchasesSection() {
  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Fornecedor", "Últimas compras", "Histórico de compras"]} context="Commerce Hub" />
      <WidgetCard title="Compras">
        <EmptyState title="Gestão de compras ainda não é suportada" description="Nenhuma Entidade de aquisição/fornecimento existe no Commerce Hub nesta Sprint." />
      </WidgetCard>
    </div>
  );
}
