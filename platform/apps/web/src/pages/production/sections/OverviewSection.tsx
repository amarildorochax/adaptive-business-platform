import { Cog, Factory, ListChecks } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { LiveIndicator } from "@shared/components/ui/LiveIndicator";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { ProcessFlow, type ProcessFlowStep } from "@shared/components/ui/ProcessFlow";
import { ProductionOrderCard } from "@shared/components/ui/ProductionOrderCard";
import { useRecentlyChanged } from "@shared/hooks/useRecentlyChanged";
import type { ProductionOrderResponseDto } from "@core/production/production.dto";

function stepStatus(hasHere: boolean, hasAhead: boolean): ProcessFlowStep["status"] {
  if (hasAhead) {
    return "completed";
  }
  return hasHere ? "current" : "pending";
}

/**
 * Constrói o funil "Planejada → Iniciada → Consumo Registrado → Produção Registrada → Concluída" a
 * partir exclusivamente de atividade real desta sessão do navegador — a única fonte disponível, já
 * que nenhuma Query tenant-wide existe para `ProductionOrder` (`ProductionPage.tsx`, "Limitações").
 *
 * **Divergência deliberada do exemplo literal desta Sprint** ("Planejada → Preparada → Em Produção →
 * Concluída → Finalizada") — "Preparada"/"Finalizada" não correspondem a nenhum valor real de
 * `ProductionStatus` (`Planned | InProgress | Completed | Cancelled`, Core, IMP-501) nem a nenhum
 * outro fato observável do domínio; per instrução explícita da própria Sprint ("Os estados deverão
 * refletir exclusivamente o domínio. Nunca inventar estados"), os cinco passos abaixo usam apenas
 * fatos reais e distintos já expostos por `ProductionOrderResponseDto`: criação (Planejada),
 * transição real a `InProgress` (Iniciada), `consumptions.length > 0` (Consumo Registrado),
 * `outputs.length > 0` (Produção Registrada), e `status === "Completed"` (Concluída). Mesma disciplina
 * de divergência documentada já aplicada por `buildLedgerFlow` (Inventory Movement Workspace, IMP-405)
 * diante da sugestão de IMP-404.
 *
 * `Cancelled` nunca é uma etapa deste funil — um ramo terminal do estado, nunca um passo do "quão
 * longe chegamos", mesma disciplina de `buildProcurementFlow` (Purchase Workspace) excluindo
 * `Cancelled`/`Rejected`; representado, por Ordem, exclusivamente por `ProductionStatusBadge`.
 */
function buildProductionFlow(orders: readonly ProductionOrderResponseDto[]): readonly ProcessFlowStep[] {
  const active = orders.filter((o) => o.status !== "Cancelled");
  const started = active.filter((o) => o.status === "InProgress" || o.status === "Completed");
  const consumed = active.filter((o) => o.consumptions.length > 0);
  const produced = active.filter((o) => o.outputs.length > 0);
  const completed = active.filter((o) => o.status === "Completed");

  const pastPlanned = started.length > 0 || consumed.length > 0 || produced.length > 0 || completed.length > 0;
  const pastStarted = consumed.length > 0 || produced.length > 0 || completed.length > 0;
  const pastConsumed = produced.length > 0 || completed.length > 0;
  const pastProduced = completed.length > 0;

  return [
    { id: "planejada", label: "Planejada", status: stepStatus(active.length > 0, pastPlanned), detail: `${active.length} ordem(ns)` },
    { id: "iniciada", label: "Iniciada", status: stepStatus(started.length > 0, pastStarted), detail: `${started.length} iniciada(s)` },
    { id: "consumo", label: "Consumo Registrado", status: stepStatus(consumed.length > 0, pastConsumed), detail: `${consumed.length} com consumo` },
    { id: "producao", label: "Produção Registrada", status: stepStatus(produced.length > 0, pastProduced), detail: `${produced.length} com geração` },
    { id: "concluida", label: "Concluída", status: completed.length > 0 ? "completed" : "pending", detail: `${completed.length} concluída(s)` },
  ];
}

/**
 * Visão Geral (IMP-505; `ProcessFlow`/`LiveIndicator` desde a UX-002) — painel operacional real.
 * Nenhuma Query tenant-wide de `ProductionOrder`/`BillOfMaterials` existe neste Hub
 * (`ProductionPage.tsx`, "Limitações") — os KPIs de atividade e o `ProcessFlow` refletem
 * exclusivamente esta sessão do navegador, mesmo princípio já usado por `OverviewSection.tsx` do
 * Inventory Movement Workspace diante da mesma ausência real de Query. "Centros de Trabalho ativos" é
 * o único KPI genuinamente tenant-wide (`useActiveWorkCenters`, real, `dataUpdatedAt` real).
 *
 * Sem botão de ação no `EmptyState` — mesma correção preventiva já aplicada desde o primeiro
 * rascunho, aprendida com o achado real de auditoria documentado em
 * `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md` (dois botões "Nova Movimentação" simultâneos no
 * DOM, já que `Drawer` nunca desmonta o conteúdo por trás de si). Nenhum botão "Nova Ordem de
 * Produção" aparece aqui — apenas a Ação Rápida do `PageHeader`.
 */
export function OverviewSection({
  activeWorkCentersCount,
  dataUpdatedAt,
  productionOrdersThisSession,
}: {
  readonly activeWorkCentersCount: number;
  readonly dataUpdatedAt: number;
  readonly productionOrdersThisSession: readonly ProductionOrderResponseDto[];
}) {
  const justUpdated = useRecentlyChanged(dataUpdatedAt);
  const inProgressCount = productionOrdersThisSession.filter((o) => o.status === "InProgress").length;
  const recentOrders = [...productionOrdersThisSession].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);

  const flow = buildProductionFlow(productionOrdersThisSession);

  return (
    <div className="dashboard-section">
      <WidgetCard title="Fluxo de Produção">
        <ProcessFlow label="Progresso das Ordens de Produção nesta sessão" steps={flow} />
      </WidgetCard>

      <KPIGrid>
        <MetricCard label="Centros de Trabalho ativos" value={String(activeWorkCentersCount)} icon={<Cog size={16} aria-hidden="true" />} tone="primary" />
        <MetricCard label="Ordens registradas nesta sessão" value={String(productionOrdersThisSession.length)} icon={<Factory size={16} aria-hidden="true" />} tone="info" />
        <MetricCard label="Ordens em execução nesta sessão" value={String(inProgressCount)} icon={<ListChecks size={16} aria-hidden="true" />} tone="warning" />
      </KPIGrid>
      {justUpdated && <LiveIndicator />}

      <WidgetCard title="Ordens recentes desta sessão">
        {recentOrders.length === 0 ? (
          <EmptyState title="Nenhuma Ordem de Produção registrada ainda nesta sessão" description="Crie a primeira Ordem pela Ação Rápida 'Nova Ordem de Produção', disponível em qualquer aba deste Workspace." />
        ) : (
          <div className="dashboard-grid">
            {recentOrders.map((order) => (
              <ProductionOrderCard
                key={order.productionOrderId}
                productionOrderId={order.productionOrderId}
                billOfMaterialsId={order.billOfMaterialsId}
                plannedOutputQuantity={order.plannedOutputQuantity}
                status={order.status}
                workCenterId={order.workCenterId}
                orderId={order.orderId}
                consumptionsCount={order.consumptions.length}
                outputsCount={order.outputs.length}
              />
            ))}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
