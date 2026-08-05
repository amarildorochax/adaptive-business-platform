import { WidgetCard } from "@shared/components/WidgetCard";
import { AlertCard } from "@shared/components/ui/AlertCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { resolveInventory, type ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";

/**
 * Alertas (FUN-105) — apenas alertas derivados de dado real, per instrução explícita ("Nunca gerar
 * alertas inventados"): "Sem estoque" (`Inventory.quantity <= 0`), "Itens inativos"
 * (`Product.status === "Discontinued"` — estruturalmente sempre vazio hoje, já que `CommerceManager`
 * nunca expõe `discontinue()`, ver relatório da FUN-104; a lógica em si é real e correta, apenas a
 * condição nunca é satisfeita por este Workspace), "Rascunhos" (`Product.status === "Draft"` — sempre
 * 100% dos Products, pelo mesmo motivo). Nenhum quarto alerta foi inventado além dos três pedidos.
 */
export function AlertsSection({ workspace }: { readonly workspace: ProductWorkspaceSnapshot }) {
  const outOfStock = workspace.products.filter((product) => (resolveInventory(workspace, product.productId)?.quantity ?? 0) <= 0);
  const discontinued = workspace.products.filter((product) => product.status === "Discontinued");
  const drafts = workspace.products.filter((product) => product.status === "Draft");

  const hasAnyAlert = outOfStock.length > 0 || discontinued.length > 0 || drafts.length > 0;

  return (
    <div className="dashboard-section">
      <WidgetCard title="Alertas">
        {!hasAnyAlert ? (
          <EmptyState title="Nenhum alerta no momento" />
        ) : (
          <div className="dashboard-grid">
            {outOfStock.length > 0 && <AlertCard title="Sem estoque" description="Produtos com quantidade zero ou não informada." severity="danger" count={outOfStock.length} items={outOfStock.map((product) => product.name)} />}
            {discontinued.length > 0 && <AlertCard title="Itens inativos" description="Produtos descontinuados." severity="warning" count={discontinued.length} items={discontinued.map((product) => product.name)} />}
            {drafts.length > 0 && <AlertCard title="Rascunhos" description="Produtos ainda não publicados (CommerceManager nunca expõe publish())." severity="info" count={drafts.length} items={drafts.map((product) => product.name)} />}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
