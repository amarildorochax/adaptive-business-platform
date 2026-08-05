import { useMemo, useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { InventoryCard } from "@shared/components/ui/InventoryCard";
import { inventoryStatus, type InventoryStatus } from "@shared/components/ui/inventoryStatus";
import { Select } from "@shared/components/ui/Select";
import { resolveCategoryName, resolveInventory, type ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";

const STATUS_LABEL: Record<InventoryStatus, string> = { "in-stock": "Em estoque", "low-stock": "Estoque baixo", "out-of-stock": "Sem estoque" };

/**
 * Inventário (FUN-105) — lista moderna real: busca por nome, filtro por Categoria e por status de
 * disponibilidade (derivado da mesma quantidade real de `Inventory`, `inventoryStatus`, FUN-104),
 * tudo client-side sobre os Products já no Product Hub Workspace (nenhuma busca server-side existe
 * em `CommerceManager`, mesmo padrão já usado pelo Catálogo do Product Hub, FUN-104). Cada item em
 * `InventoryCard` (FUN-105, foco operacional — nunca preço).
 */
export function InventoryListSection({ workspace }: { readonly workspace: ProductWorkspaceSnapshot }) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | InventoryStatus>("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return workspace.products
      .filter((product) => (needle ? product.name.toLowerCase().includes(needle) : true))
      .filter((product) => (categoryFilter === "all" ? true : product.categoryId === categoryFilter))
      .filter((product) => {
        if (statusFilter === "all") {
          return true;
        }
        const quantity = resolveInventory(workspace, product.productId)?.quantity ?? 0;
        return inventoryStatus(quantity, 10) === statusFilter;
      });
  }, [workspace, query, categoryFilter, statusFilter]);

  return (
    <div className="dashboard-section">
      <WidgetCard title="Inventário">
        <div className="form-grid">
          <Field label="Buscar" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome…" />
          <Select label="Categoria" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">Todas</option>
            {workspace.categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </Select>
          <Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | InventoryStatus)}>
            <option value="all">Todos</option>
            {(Object.keys(STATUS_LABEL) as InventoryStatus[]).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="Nenhum item encontrado" description="Ajuste a busca/filtro acima." />
        ) : (
          <div className="product-grid">
            {filtered.map((product) => {
              const inventory = resolveInventory(workspace, product.productId);
              return <InventoryCard key={product.productId} productName={product.name} categoryName={resolveCategoryName(workspace, product.categoryId)} quantity={inventory?.quantity ?? 0} updatedAt={inventory?.updatedAt.toISOString()} />;
            })}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
