import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { CategoryBadge } from "@shared/components/ui/CategoryBadge";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { Select } from "@shared/components/ui/Select";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";
import { useCreateCategory } from "@core/query/useCreateCategory";

/**
 * Categorias (FUN-104) — lista real das Categories já criadas nesta sessão (`Category.parentCategoryId`
 * suporta hierarquia real, mostrada aqui como "Categoria-pai"). "Nova Categoria" invoca o Command real
 * `createCategory`. Nenhum Evento aprovado cobre Category (`CommerceEvent.ts`) — nenhuma entrada nova
 * aparece na Timeline (Histórico) ao criar uma.
 */
export function CategoriesSection({ workspace, tenantId }: { readonly workspace: ProductWorkspaceSnapshot; readonly tenantId: string }) {
  const createCategory = useCreateCategory();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");

  function handleCreate() {
    if (!name.trim()) {
      return;
    }
    createCategory.mutate(
      { tenantId, name: name.trim(), parentCategoryId: parentCategoryId || undefined },
      { onSuccess: () => { showToast("success", "Categoria criada."); setName(""); }, onError: () => showToast("danger", "Não foi possível criar a Categoria.") },
    );
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Nova Categoria">
        <div className="form-grid">
          <Field label="Nome" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Acessórios" />
          <Select label="Categoria-pai" value={parentCategoryId} onChange={(event) => setParentCategoryId(event.target.value)}>
            <option value="">Nenhuma (categoria de topo)</option>
            {workspace.categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="button" variant="primary" onClick={handleCreate} disabled={createCategory.isPending || !name.trim()}>
          {createCategory.isPending ? "Criando…" : "Criar Categoria"}
        </Button>
      </WidgetCard>

      <WidgetCard title="Categorias">
        {workspace.categories.length === 0 ? (
          <EmptyState title="Nenhuma Categoria criada ainda" />
        ) : (
          <div className="component-gallery-row">
            {workspace.categories.map((category) => {
              const parent = workspace.categories.find((candidate) => candidate.categoryId === category.parentCategoryId);
              return (
                <div key={category.categoryId} className="palette-swatch-item">
                  <CategoryBadge name={category.name} />
                  {parent && <span className="activity-log-list__time">em {parent.name}</span>}
                </div>
              );
            })}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
