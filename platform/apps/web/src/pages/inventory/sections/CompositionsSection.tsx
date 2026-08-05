import { WidgetCard } from "@shared/components/WidgetCard";
import { CategoryBadge } from "@shared/components/ui/CategoryBadge";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { resolveCategoryName, resolveInventory, type ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";

/**
 * Composições (FUN-105) — "Consumir dados reais do Product Hub" (instrução explícita): a lista de
 * Products abaixo é real, o mesmo Product Hub Workspace já usado em todo o Inventory Workspace — mas
 * nenhuma relação de composição existe em `packages/commerce-hub` (confirmado também na auditoria da
 * FUN-104: nenhum Bill of Materials, nenhum campo em `Product`/`Variant` referencia outro Product).
 * Por isso, esta seção mostra os Products reais como potenciais "componentes" (o material-base que um
 * dia poderia formar um Kit/Combo), nunca uma composição em si — "Produtos compostos" e "Dependências"
 * permanecem `NotConnectedNotice`. `CompositionCard` (FUN-104) segue sem nenhum dado fabricado.
 */
export function CompositionsSection({ workspace }: { readonly workspace: ProductWorkspaceSnapshot }) {
  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Produtos compostos", "Dependências"]} context="Commerce Hub" />

      <WidgetCard title="Produtos disponíveis como componentes (dado real, somente leitura)">
        {workspace.products.length === 0 ? (
          <EmptyState title="Nenhum Produto cadastrado ainda" />
        ) : (
          <div className="component-gallery-row">
            {workspace.products.map((product) => (
              <div key={product.productId} className="palette-swatch-item">
                <span>{product.name}</span>
                {resolveCategoryName(workspace, product.categoryId) && <CategoryBadge name={resolveCategoryName(workspace, product.categoryId)!} />}
                <span className="activity-log-list__time">{resolveInventory(workspace, product.productId)?.quantity ?? 0} un.</span>
              </div>
            ))}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
