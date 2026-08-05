import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { InventoryIndicator } from "@shared/components/ui/InventoryIndicator";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { ReservationBadge } from "@shared/components/ui/ReservationBadge";
import { resolveInventory, type ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";

/**
 * Disponibilidade (FUN-105) — apenas duas das quatro dimensões pedidas pela Sprint têm dado real:
 * "Disponível" é a própria `Inventory.quantity`; "Rascunho" é real por uma via indireta honesta —
 * todo Product criado por este Workspace permanece `Product.status === "Draft"` para sempre
 * (`CommerceManager` nunca expõe `publish()`/`discontinue()`, ver relatório da FUN-104), então "em
 * Rascunho" é, hoje, o estado real de 100% dos Products. "Reservado" e "Em uso", pedidos pela Sprint,
 * não têm nenhum campo correspondente em `Inventory`/`Product` — `NotConnectedNotice` explícito.
 * `ReservationBadge` (novo, FUN-105) é mostrado aqui apenas com `status="available"` (o único status
 * real possível hoje), nunca com "reserved"/"released" fabricados.
 */
export function AvailabilitySection({ workspace }: { readonly workspace: ProductWorkspaceSnapshot }) {
  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Reservado", "Em uso"]} context="Commerce Hub" />

      <WidgetCard title="Disponibilidade por Produto">
        {workspace.products.length === 0 ? (
          <EmptyState title="Nenhum Produto cadastrado ainda" />
        ) : (
          <div className="dashboard-grid">
            {workspace.products.map((product) => {
              const quantity = resolveInventory(workspace, product.productId)?.quantity ?? 0;
              return (
                <WidgetCard key={product.productId} title={product.name}>
                  <InventoryIndicator quantity={quantity} label="disponíveis" />
                  <div className="component-gallery-row">
                    {quantity > 0 && <ReservationBadge status="available" />}
                    {product.status === "Draft" && <span className="category-badge">Rascunho</span>}
                  </div>
                </WidgetCard>
              );
            })}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
