import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { MovementCard } from "@shared/components/ui/MovementCard";
import { Select } from "@shared/components/ui/Select";
import { Timeline, type TimelineStep } from "@shared/components/ui/Timeline";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { ProductEventLogEntry, ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";
import { useAdjustInventory } from "@core/query/useAdjustInventory";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function toSteps(log: readonly ProductEventLogEntry[]): readonly TimelineStep[] {
  const sorted = [...log].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  return sorted.map((entry, index) => ({ id: entry.id, label: `${formatDateTime(entry.occurredAt)} — ${entry.label}`, status: index === sorted.length - 1 ? "current" : "completed" }));
}

/**
 * Movimentações (FUN-105) — Entradas/Saídas/Ajustes reais, todos derivados do mesmo Command
 * `adjustInventory` (`CommerceManager`, único método que produz `StockUpdated`) — a direção
 * (Entrada/Saída) vem do sinal real do `delta` já conhecido no momento da mutação (`MovementCard`,
 * nunca reconstruído). Nenhum "StockMovement" (ledger dedicado por movimentação) existe no domínio —
 * `Inventory.ts` documenta essa decisão explicitamente — então esta seção é inteiramente reconstruída
 * a partir do `eventLog` já acumulado no Product Hub Workspace, filtrado para `StockUpdated`, nunca
 * uma Query própria. Nenhuma movimentação fictícia é criada.
 */
export function MovementsSection({ workspace }: { readonly workspace: ProductWorkspaceSnapshot }) {
  const adjustInventory = useAdjustInventory();
  const { showToast } = useToast();
  const [productId, setProductId] = useState(workspace.products[0]?.productId ?? "");
  const [delta, setDelta] = useState("");

  const movements = workspace.eventLog.filter((entry) => entry.type === "StockUpdated");
  const sorted = [...movements].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  function handleRegister() {
    const numericDelta = Number(delta);
    if (!productId || Number.isNaN(numericDelta) || numericDelta === 0) {
      return;
    }
    adjustInventory.mutate(
      { productId, delta: numericDelta },
      { onSuccess: () => { showToast("success", "Movimentação registrada."); setDelta(""); }, onError: () => showToast("danger", "Não foi possível registrar a movimentação.") },
    );
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Registrar Movimentação">
        <div className="form-grid">
          <Select label="Produto" value={productId} onChange={(event) => setProductId(event.target.value)}>
            {workspace.products.length === 0 && <option value="">Nenhum Produto cadastrado</option>}
            {workspace.products.map((product) => (
              <option key={product.productId} value={product.productId}>
                {product.name}
              </option>
            ))}
          </Select>
          <Field label="Quantidade (+ entrada / − saída)" type="number" value={delta} onChange={(event) => setDelta(event.target.value)} placeholder="Ex.: 10 ou -5" />
        </div>
        <Button type="button" variant="primary" onClick={handleRegister} disabled={adjustInventory.isPending || !productId}>
          {adjustInventory.isPending ? "Registrando…" : "Registrar"}
        </Button>
      </WidgetCard>

      <WidgetCard title="Linha do tempo de Movimentações">
        {movements.length === 0 ? <EmptyState title="Nenhuma movimentação ainda" /> : <Timeline label="Movimentações de Estoque" steps={toSteps(movements)} />}
      </WidgetCard>

      {sorted.length > 0 && (
        <WidgetCard title="Detalhe por movimentação">
          <div className="component-gallery-stack">
            {sorted.map((entry) => {
              const product = workspace.products.find((candidate) => candidate.productId === entry.productId);
              return <MovementCard key={entry.id} productName={product?.name ?? "Produto"} label={entry.label} occurredAt={entry.occurredAt} delta={entry.delta} />;
            })}
          </div>
        </WidgetCard>
      )}
    </div>
  );
}
