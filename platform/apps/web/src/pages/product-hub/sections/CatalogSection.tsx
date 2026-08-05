import { useMemo, useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { ProductCard } from "@shared/components/ui/ProductCard";
import { Select } from "@shared/components/ui/Select";
import { useToast } from "@shared/components/ui/toast/useToast";
import { resolveCategoryName, resolveCurrentPrice, resolveInventory, type ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";
import { useCreateProduct } from "@core/query/useCreateProduct";

type SortKey = "name" | "createdAt";

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Catálogo (FUN-104) — lista moderna real: busca, filtro por Categoria e ordenação, tudo client-side
 * sobre os Products já acumulados no Product Hub Workspace (nenhuma busca server-side existe em
 * `CommerceManager`, mesmo padrão já usado por `Table`/Clientes do CRM Workspace, FUN-103). "Novo
 * Produto" invoca o Command real `createProduct` — `catalogId` é sempre o único Catalog já semeado
 * nesta sessão (`CommerceManager` não expõe nenhuma forma de criar um segundo Catalog através desta
 * seção, per a decisão de manter o formulário simples).
 */
export function CatalogSection({ workspace, tenantId }: { readonly workspace: ProductWorkspaceSnapshot; readonly tenantId: string }) {
  const createProduct = useCreateProduct();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(workspace.categories[0]?.categoryId ?? "");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return workspace.products
      .filter((product) => (needle ? product.name.toLowerCase().includes(needle) : true))
      .filter((product) => (categoryFilter === "all" ? true : product.categoryId === categoryFilter))
      .slice()
      .sort((a, b) => (sortKey === "name" ? a.name.localeCompare(b.name) : b.createdAt.getTime() - a.createdAt.getTime()));
  }, [workspace.products, query, categoryFilter, sortKey]);

  const catalogId = workspace.catalogs[0]?.catalogId;

  function handleCreate() {
    if (!name.trim() || !catalogId) {
      return;
    }
    createProduct.mutate(
      { tenantId, catalogId, categoryId: categoryId || undefined, name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          showToast("success", "Produto criado.");
          setName("");
          setDescription("");
        },
        onError: () => showToast("danger", "Não foi possível criar o Produto."),
      },
    );
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Novo Produto">
        <div className="form-grid">
          <Field label="Nome" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Kit Ferramentas Básico" />
          <Field label="Descrição" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Opcional" />
          <Select label="Categoria" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="">Sem categoria</option>
            {workspace.categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="button" variant="primary" onClick={handleCreate} disabled={createProduct.isPending || !name.trim()}>
          {createProduct.isPending ? "Criando…" : "Criar Produto"}
        </Button>
      </WidgetCard>

      <WidgetCard title="Catálogo">
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
          <Select label="Ordenar por" value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
            <option value="name">Nome</option>
            <option value="createdAt">Mais recentes</option>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="Nenhum Produto encontrado" description="Ajuste a busca/filtro ou crie um novo Produto acima." />
        ) : (
          <div className="product-grid">
            {filtered.map((product) => {
              const price = resolveCurrentPrice(workspace, product.productId);
              const inventory = resolveInventory(workspace, product.productId);
              return (
                <ProductCard
                  key={product.productId}
                  name={product.name}
                  description={product.description}
                  status={product.status}
                  categoryName={resolveCategoryName(workspace, product.categoryId)}
                  priceLabel={price ? formatCurrency(price.amount, price.currency) : undefined}
                  inventoryQuantity={inventory?.quantity}
                />
              );
            })}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
