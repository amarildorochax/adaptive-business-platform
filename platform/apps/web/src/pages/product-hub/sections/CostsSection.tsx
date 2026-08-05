import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { PriceCard } from "@shared/components/ui/PriceCard";
import { resolveCurrentPrice, type ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";

/**
 * Custos (FUN-104) — "Somente se houver suporte" (instrução explícita da Sprint). `Price` só tem
 * `amount` (preço de lista) — nenhum campo de custo existe em `Product`/`Price`/`Variant`, então
 * Custo, Margem e Lucro não são calculáveis. Preço é real (mesmo dado já mostrado em Precificação,
 * repetido aqui apenas porque a Sprint pede "Preço" nesta seção também — nunca uma segunda fonte).
 */
export function CostsSection({ workspace }: { readonly workspace: ProductWorkspaceSnapshot }) {
  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Custo", "Margem", "Lucro"]} context="Commerce Hub" />

      <WidgetCard title="Preço de lista">
        {workspace.products.length === 0 ? (
          <EmptyState title="Nenhum Produto cadastrado ainda" />
        ) : (
          <div className="dashboard-grid">
            {workspace.products.map((product) => {
              const price = resolveCurrentPrice(workspace, product.productId);
              return price ? <PriceCard key={product.productId} label={product.name} amount={price.amount} currency={price.currency} /> : null;
            })}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
