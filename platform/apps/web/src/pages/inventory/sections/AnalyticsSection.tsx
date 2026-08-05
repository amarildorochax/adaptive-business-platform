import { Boxes, PackageCheck, PackageX, Tags } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Badge } from "@shared/components/ui/Badge";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { inventoryStatus } from "@shared/components/ui/inventoryStatus";
import { resolveInventory, type ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";

/**
 * Analytics (FUN-105) — apenas dado real (per instrução explícita "Somente dados reais"):
 * distribuição por status de disponibilidade (Em estoque/Estoque baixo/Sem estoque, mesma
 * classificação real já usada por `InventoryBadge`, FUN-104), quantidade total em estoque,
 * distribuição por Categoria. Nenhuma tendência histórica, nenhuma previsão.
 */
export function AnalyticsSection({ workspace }: { readonly workspace: ProductWorkspaceSnapshot }) {
  const statuses = workspace.products.map((product) => inventoryStatus(resolveInventory(workspace, product.productId)?.quantity ?? 0, 10));
  const inStock = statuses.filter((status) => status === "in-stock").length;
  const lowStock = statuses.filter((status) => status === "low-stock").length;
  const outOfStock = statuses.filter((status) => status === "out-of-stock").length;
  const totalQuantity = workspace.inventory.reduce((sum, entry) => sum + entry.quantity, 0);

  const categoryDistribution = workspace.categories.map((category) => ({
    name: category.name,
    count: workspace.products.filter((product) => product.categoryId === category.categoryId).length,
  }));

  return (
    <div className="dashboard-section">
      <KPIGrid>
        <MetricCard icon={<PackageCheck size={16} aria-hidden="true" />} label="Em estoque" value={String(inStock)} tone="success" />
        <MetricCard icon={<Boxes size={16} aria-hidden="true" />} label="Estoque baixo" value={String(lowStock)} tone="warning" />
        <MetricCard icon={<PackageX size={16} aria-hidden="true" />} label="Sem estoque" value={String(outOfStock)} tone="danger" />
        <MetricCard icon={<Tags size={16} aria-hidden="true" />} label="Quantidade total" value={String(totalQuantity)} hint="unidades" tone="primary" />
      </KPIGrid>

      <WidgetCard title="Distribuição por Categoria">
        {categoryDistribution.length === 0 ? (
          <p>Nenhuma Categoria criada ainda.</p>
        ) : (
          <div className="component-gallery-row">
            {categoryDistribution.map((entry) => (
              <Badge key={entry.name} tone="neutral">
                {entry.name}: {entry.count}
              </Badge>
            ))}
          </div>
        )}
      </WidgetCard>

      <NotConnectedNotice fields={["Tendência histórica entre sessões", "Previsão de ruptura de estoque"]} context="Commerce Hub" />
    </div>
  );
}
