import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { InventoryBadge } from "@shared/components/ui/InventoryBadge";
import { InventoryIndicator } from "@shared/components/ui/InventoryIndicator";
import { Select } from "@shared/components/ui/Select";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";
import { useAdjustInventory } from "@core/query/useAdjustInventory";

/**
 * Estoque (FUN-104) — real: `Inventory.quantity` já acumulado no Product Hub Workspace, cada linha
 * com `InventoryIndicator` (quantidade em destaque) e `InventoryBadge` (status compacto). "Ajustar
 * Estoque" invoca o Command real `adjustInventory` (`StockUpdated`) — aceita um `delta` positivo ou
 * negativo, exatamente como `InventoryService.adjust` já define; nenhum "StockMovement" (ledger por
 * movimentação) existe no domínio (ver `Inventory.ts`), então apenas o saldo atual é mostrado, nunca
 * um histórico de movimentações isolado desta seção (ver Histórico).
 */
export function StockSection({ workspace }: { readonly workspace: ProductWorkspaceSnapshot }) {
  const adjustInventory = useAdjustInventory();
  const { showToast } = useToast();
  const [productId, setProductId] = useState(workspace.products[0]?.productId ?? "");
  const [delta, setDelta] = useState("");

  function handleAdjust() {
    const numericDelta = Number(delta);
    if (!productId || Number.isNaN(numericDelta) || numericDelta === 0) {
      return;
    }
    adjustInventory.mutate(
      { productId, delta: numericDelta },
      { onSuccess: () => { showToast("success", "Estoque ajustado."); setDelta(""); }, onError: () => showToast("danger", "Não foi possível ajustar o Estoque.") },
    );
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Ajustar Estoque">
        <div className="form-grid">
          <Select label="Produto" value={productId} onChange={(event) => setProductId(event.target.value)}>
            {workspace.products.length === 0 && <option value="">Nenhum Produto cadastrado</option>}
            {workspace.products.map((product) => (
              <option key={product.productId} value={product.productId}>
                {product.name}
              </option>
            ))}
          </Select>
          <Field label="Ajuste (+ entrada / − saída)" type="number" value={delta} onChange={(event) => setDelta(event.target.value)} placeholder="Ex.: 10 ou -5" />
        </div>
        <Button type="button" variant="primary" onClick={handleAdjust} disabled={adjustInventory.isPending || !productId}>
          {adjustInventory.isPending ? "Ajustando…" : "Ajustar"}
        </Button>
      </WidgetCard>

      <WidgetCard title="Estoque por Produto">
        {workspace.inventory.length === 0 ? (
          <EmptyState title="Nenhum registro de Estoque ainda" />
        ) : (
          <div className="dashboard-grid">
            {workspace.inventory.map((entry) => {
              const product = workspace.products.find((candidate) => candidate.productId === entry.productId);
              return (
                <WidgetCard key={entry.inventoryId} title={product?.name ?? entry.productId}>
                  <InventoryIndicator quantity={entry.quantity} />
                  <InventoryBadge quantity={entry.quantity} />
                </WidgetCard>
              );
            })}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
