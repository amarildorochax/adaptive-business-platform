import { ArrowRightLeft, Bookmark, MapPin } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { LiveIndicator } from "@shared/components/ui/LiveIndicator";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { ProcessFlow, type ProcessFlowStep } from "@shared/components/ui/ProcessFlow";
import { StockMovementCard } from "@shared/components/ui/StockMovementCard";
import { useRecentlyChanged } from "@shared/hooks/useRecentlyChanged";
import type { StockMovementResponseDto, StockReservationResponseDto } from "@core/inventory-movement/inventoryMovement.dto";

function stepStatus(hasHere: boolean, hasAhead: boolean): ProcessFlowStep["status"] {
  if (hasAhead) {
    return "completed";
  }
  return hasHere ? "current" : "pending";
}

/**
 * Constrói o funil "Entrada → Reserva → Disponível → Consumo → Saída" (exigido literalmente por
 * IMP-405) a partir exclusivamente de atividade real desta sessão do navegador — a única fonte
 * disponível, já que nenhuma Query tenant-wide existe para Movement/Reservation
 * (`InventoryMovementPage.tsx`, "Limitações"). Interpretação explícita de cada etapa, per "Nunca
 * simular estados" — cada uma corresponde a um fato real e distinto do ledger, nunca uma
 * aproximação:
 * - Entrada: Stock Movement com `quantityDelta` positivo (`Purchase`/`ProductionOutput`/`SaleReturn`/
 *   `ManualAdjustment` positivo).
 * - Reserva: Stock Reservation criada nesta sessão (qualquer status — o fato de ter existido).
 * - Disponível: Stock Reservation liberada nesta sessão (`Released`) — quantidade que voltou a ficar
 *   disponível de fato.
 * - Consumo: Stock Movement de origem `ProductionConsumption` — insumo de Produção efetivamente
 *   consumido.
 * - Saída: Stock Movement com `quantityDelta` negativo cuja origem não é `ProductionConsumption`
 *   (tipicamente `SaleFulfillment`, via `convertReservationToMovement`).
 */
function buildLedgerFlow(movements: readonly StockMovementResponseDto[], reservations: readonly StockReservationResponseDto[]): readonly ProcessFlowStep[] {
  const entries = movements.filter((m) => m.quantityDelta > 0);
  const reserved = reservations;
  const released = reservations.filter((r) => r.status === "Released");
  const consumed = movements.filter((m) => m.origin === "ProductionConsumption");
  const exits = movements.filter((m) => m.quantityDelta < 0 && m.origin !== "ProductionConsumption");

  const pastEntry = reserved.length > 0 || released.length > 0 || consumed.length > 0 || exits.length > 0;
  const pastReserve = released.length > 0 || consumed.length > 0 || exits.length > 0;
  const pastAvailable = consumed.length > 0 || exits.length > 0;
  const pastConsumption = exits.length > 0;

  return [
    { id: "entrada", label: "Entrada", status: stepStatus(entries.length > 0, pastEntry), detail: `${entries.length} movimentação(ões)` },
    { id: "reserva", label: "Reserva", status: stepStatus(reserved.length > 0, pastReserve), detail: `${reserved.length} reserva(s)` },
    { id: "disponivel", label: "Disponível", status: stepStatus(released.length > 0, pastAvailable), detail: `${released.length} liberada(s)` },
    { id: "consumo", label: "Consumo", status: stepStatus(consumed.length > 0, pastConsumption), detail: `${consumed.length} consumo(s)` },
    { id: "saida", label: "Saída", status: exits.length > 0 ? "completed" : "pending", detail: `${exits.length} saída(s)` },
  ];
}

/**
 * Visão Geral (IMP-405; `ProcessFlow`/`LiveIndicator` desde a UX-002) — painel operacional real.
 * Diferente do Supplier/Purchase Workspace, nenhuma Query tenant-wide de Movement/Reservation existe
 * neste Hub (`InventoryMovementPage.tsx`, "Limitações") — os KPIs de atividade e o `ProcessFlow`
 * refletem exclusivamente esta sessão do navegador, mesmo princípio já usado pelo KPI "Finalizados
 * nesta sessão" do Purchase Workspace diante da mesma ausência real de Query. "Localizações ativas" é
 * o único KPI genuinamente tenant-wide (`useActiveStockLocations`, real, `dataUpdatedAt` real).
 *
 * **Sem botão de ação no `EmptyState` — achado real de auditoria (Passo 1), corrigido nesta Sprint.**
 * A primeira versão desta seção desenhava aqui um segundo botão "Nova Movimentação", com o mesmo nome
 * acessível do `PageHeader.actions` (`InventoryMovementPage.tsx`) — como o `Drawer` nunca desmonta o
 * conteúdo por trás de si (`Drawer.tsx`, um overlay, não uma troca de árvore), os dois botões
 * "Nova Movimentação" ficavam simultaneamente no DOM, uma ambiguidade real de nome acessível
 * (`getByRole("button", { name: "Nova Movimentação" })` deixa de identificar um único elemento).
 * Mesma classe de achado do Purchase Workspace (`IMP_305_PURCHASE_WORKSPACE_REPORT.md`, rótulos de
 * botão duplicados) — corrigido aqui do mesmo jeito que o próprio `PurchasePage.tsx`/`OverviewSection.tsx`
 * (Purchase Hub) já evita o problema: nenhum botão redundante no `EmptyState`, apenas a descrição
 * apontando para a Ação Rápida já disponível em qualquer aba.
 */
export function OverviewSection({
  activeLocationsCount,
  dataUpdatedAt,
  movementsThisSession,
  reservationsThisSession,
}: {
  readonly activeLocationsCount: number;
  readonly dataUpdatedAt: number;
  readonly movementsThisSession: readonly StockMovementResponseDto[];
  readonly reservationsThisSession: readonly StockReservationResponseDto[];
}) {
  const justUpdated = useRecentlyChanged(dataUpdatedAt);
  const activeReservations = reservationsThisSession.filter((r) => r.status === "Active");
  const recentMovements = [...movementsThisSession].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 3);

  const flow = buildLedgerFlow(movementsThisSession, reservationsThisSession);

  return (
    <div className="dashboard-section">
      <WidgetCard title="Fluxo do Ledger">
        <ProcessFlow label="Progresso do Ledger nesta sessão" steps={flow} />
      </WidgetCard>

      <KPIGrid>
        <MetricCard label="Localizações ativas" value={String(activeLocationsCount)} icon={<MapPin size={16} aria-hidden="true" />} tone="primary" />
        <MetricCard label="Movimentações nesta sessão" value={String(movementsThisSession.length)} icon={<ArrowRightLeft size={16} aria-hidden="true" />} tone="info" />
        <MetricCard label="Reservas ativas nesta sessão" value={String(activeReservations.length)} icon={<Bookmark size={16} aria-hidden="true" />} tone="warning" />
      </KPIGrid>
      {justUpdated && <LiveIndicator />}

      <WidgetCard title="Movimentações recentes desta sessão">
        {recentMovements.length === 0 ? (
          <EmptyState title="Nenhuma movimentação registrada ainda nesta sessão" description="Registre a primeira movimentação pela Ação Rápida 'Nova Movimentação', disponível em qualquer aba deste Workspace." />
        ) : (
          <div className="dashboard-grid">
            {recentMovements.map((movement) => (
              <StockMovementCard
                key={movement.movementId}
                movementId={movement.movementId}
                productId={movement.productId}
                quantityDelta={movement.quantityDelta}
                origin={movement.origin}
                occurredAt={movement.occurredAt}
                locationId={movement.locationId}
              />
            ))}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
