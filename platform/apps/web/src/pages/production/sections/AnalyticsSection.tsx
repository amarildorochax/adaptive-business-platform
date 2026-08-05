import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import type { ProductionOrderResponseDto } from "@core/production/production.dto";

/**
 * Analytics (IMP-505) — "Mostrar somente métricas realmente disponíveis. Nunca calcular regras do
 * Core no Frontend." Nenhuma Query tenant-wide existe para `ProductionOrder`/`BillOfMaterials`
 * (`ProductionPage.tsx`, "Limitações") — todo indicador abaixo é uma agregação real, porém apenas
 * sobre a atividade desta sessão do navegador (`productionOrdersThisSession`,
 * `productionHistoryLog.ts`), nunca o histórico completo real da Empresa. Mesma divergência já
 * documentada por `AnalyticsSection.tsx` do Inventory Movement Workspace diante da mesma ausência
 * real de arquitetura — por isso esta seção é marcada `hasRealData: false` em `productionSections.ts`.
 *
 * `totalConsumedCost`/`totalGeneratedQuantity` (`core/production/`, IMP-504) **nunca são recalculados
 * aqui** — somar `acquisitionCost`/`quantityGenerated` localmente reproduziria a regra de negócio
 * "soma do acquisitionCost dos insumos consumidos" (`PRODUCTION_HUB.md`, Capítulo 3) fora do Core,
 * violando a regra final desta Sprint ("Nenhuma regra de negócio poderá existir na interface"); os
 * dois totais reais só são exibidos por Ordem, na seção "Ordens em Execução", nunca agregados aqui.
 */
export function AnalyticsSection({ productionOrdersThisSession }: { readonly productionOrdersThisSession: readonly ProductionOrderResponseDto[] }) {
  if (productionOrdersThisSession.length === 0) {
    return (
      <div className="dashboard-section">
        <EmptyState title="Nenhum dado ainda nesta sessão" description="Crie ao menos uma Ordem de Produção para ver indicadores." />
        <NotConnectedNotice fields={["Analytics tenant-wide (histórico completo)"]} context="Production Hub (nenhuma Query tenant-wide existe neste domínio)" />
      </div>
    );
  }

  const planned = productionOrdersThisSession.filter((o) => o.status === "Planned").length;
  const inProgress = productionOrdersThisSession.filter((o) => o.status === "InProgress").length;
  const completed = productionOrdersThisSession.filter((o) => o.status === "Completed").length;
  const cancelled = productionOrdersThisSession.filter((o) => o.status === "Cancelled").length;
  const totalConsumptions = productionOrdersThisSession.reduce((sum, o) => sum + o.consumptions.length, 0);
  const totalOutputs = productionOrdersThisSession.reduce((sum, o) => sum + o.outputs.length, 0);

  return (
    <div className="dashboard-section">
      <KPIGrid>
        <MetricCard label="Planejadas" value={String(planned)} tone="neutral" />
        <MetricCard label="Em execução" value={String(inProgress)} tone="primary" />
        <MetricCard label="Concluídas" value={String(completed)} tone="success" />
        <MetricCard label="Canceladas" value={String(cancelled)} tone="danger" />
        <MetricCard label="Registros de consumo" value={String(totalConsumptions)} tone="warning" />
        <MetricCard label="Registros de geração" value={String(totalOutputs)} tone="info" />
      </KPIGrid>

      <WidgetCard title="Ordens por Composição (nesta sessão)">
        <ul className="activity-log-list">
          {[...new Map(productionOrdersThisSession.map((o) => [o.billOfMaterialsId, 0])).keys()].map((billOfMaterialsId) => {
            const count = productionOrdersThisSession.filter((o) => o.billOfMaterialsId === billOfMaterialsId).length;
            return (
              <li key={billOfMaterialsId}>
                <span>Composição {billOfMaterialsId.slice(0, 8)}</span>
                <span>{count} ordem(ns)</span>
              </li>
            );
          })}
        </ul>
      </WidgetCard>

      <NotConnectedNotice
        fields={["Analytics tenant-wide (histórico completo)", "Custo total consumido consolidado", "Eficiência de produção (planejado vs. realizado)"]}
        context="Production Hub (indicadores consolidados são exclusivos do Analytics Hub, per DOMAIN_OWNERSHIP_MATRIX.md — nunca calculados localmente)"
      />
    </div>
  );
}
