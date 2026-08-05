import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import type { StockMovementResponseDto, StockReservationResponseDto } from "@core/inventory-movement/inventoryMovement.dto";

/**
 * Analytics (IMP-405) — "Mostrar somente métricas derivadas dos dados existentes. Nunca criar
 * gráficos fictícios." **Diverge deliberadamente do precedente do Purchase Workspace** — lá,
 * `AnalyticsSection` agregava `usePurchaseOrders(tenantId)`, uma Query tenant-wide real. Aqui, nenhuma
 * Query equivalente existe (`InventoryMovementPage.tsx`, "Limitações") — todo indicador abaixo é uma
 * agregação real, porém apenas sobre a atividade desta sessão do navegador (`movementsThisSession`/
 * `reservationsThisSession`, `inventoryMovementHistoryLog.ts`), nunca o histórico completo real da
 * Empresa. `NotConnectedNotice` comunica exatamente essa diferença — por isso esta seção é marcada
 * `hasRealData: false` em `inventoryMovementSections.ts`, também divergindo do Purchase Workspace por
 * um motivo genuíno de arquitetura, nunca por descuido.
 */
export function AnalyticsSection({
  movementsThisSession,
  reservationsThisSession,
  activeLocationsCount,
}: {
  readonly movementsThisSession: readonly StockMovementResponseDto[];
  readonly reservationsThisSession: readonly StockReservationResponseDto[];
  readonly activeLocationsCount: number;
}) {
  if (movementsThisSession.length === 0 && reservationsThisSession.length === 0) {
    return (
      <div className="dashboard-section">
        <EmptyState title="Nenhum dado ainda nesta sessão" description="Registre ao menos uma movimentação para ver indicadores." />
        <NotConnectedNotice fields={["Analytics tenant-wide (histórico completo)"]} context="Inventory Movement Hub (nenhuma Query tenant-wide existe neste domínio)" />
      </div>
    );
  }

  const originCounts = new Map<string, number>();
  const productCounts = new Map<string, number>();
  let totalIn = 0;
  let totalOut = 0;

  for (const movement of movementsThisSession) {
    originCounts.set(movement.origin, (originCounts.get(movement.origin) ?? 0) + 1);
    productCounts.set(movement.productId, (productCounts.get(movement.productId) ?? 0) + 1);
    if (movement.quantityDelta > 0) {
      totalIn += movement.quantityDelta;
    } else {
      totalOut += Math.abs(movement.quantityDelta);
    }
  }

  const activeReservations = reservationsThisSession.filter((r) => r.status === "Active").length;

  return (
    <div className="dashboard-section">
      <KPIGrid>
        <MetricCard label="Total de entradas (un.)" value={String(totalIn)} tone="success" />
        <MetricCard label="Total de saídas (un.)" value={String(totalOut)} tone="danger" />
        <MetricCard label="Produtos distintos movimentados" value={String(productCounts.size)} tone="info" />
        <MetricCard label="Localizações ativas" value={String(activeLocationsCount)} tone="neutral" />
        <MetricCard label="Reservas ativas" value={String(activeReservations)} tone="warning" />
      </KPIGrid>

      <WidgetCard title="Distribuição por Origem (nesta sessão)">
        <ul className="activity-log-list">
          {[...originCounts.entries()].sort((a, b) => b[1] - a[1]).map(([origin, count]) => (
            <li key={origin}>
              <span>{origin}</span>
              <span>{count} movimentação(ões)</span>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <NotConnectedNotice fields={["Analytics tenant-wide (histórico completo)", "Giro de estoque", "Cobertura em dias"]} context="Inventory Movement Hub (indicadores consolidados são exclusivos do Analytics Hub, per DOMAIN_OWNERSHIP_MATRIX.md — nunca calculados localmente)" />
    </div>
  );
}
