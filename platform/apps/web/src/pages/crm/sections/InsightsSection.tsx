import { Clock, PieChart, TrendingUp } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import type { CrmWorkspaceSnapshot } from "@core/crm/crmWorkspace";

function averageDaysToClose(workspace: CrmWorkspaceSnapshot): number | undefined {
  const closed = workspace.opportunities.filter((opportunity) => opportunity.closedAt !== undefined);
  if (closed.length === 0) {
    return undefined;
  }
  const totalMs = closed.reduce((sum, opportunity) => sum + (new Date(opportunity.closedAt!).getTime() - new Date(opportunity.createdAt).getTime()), 0);
  return totalMs / closed.length / (1000 * 60 * 60 * 24);
}

/**
 * Insights (FUN-103) — apenas dado real, derivado do CRM Workspace desta sessão (per instrução
 * explícita: "Nunca gerar IA fictícia"). Distribuição por Status é o campo real `outcome`; "Tempo
 * médio" usa `createdAt`/`closedAt`, ambos reais em `Opportunity`. Nenhuma tendência histórica, nenhum
 * benchmark de mercado — a amostra é exclusivamente o que este navegador já viu nesta sessão, nunca
 * uma consulta agregada real (`CRM Analytics`, catalogado em `CRM_HUB.md` Capítulo 7, não implementado).
 */
export function InsightsSection({ workspace }: { readonly workspace: CrmWorkspaceSnapshot }) {
  const total = workspace.opportunities.length;
  const open = workspace.opportunities.filter((opportunity) => opportunity.outcome === "Open").length;
  const won = workspace.opportunities.filter((opportunity) => opportunity.outcome === "Won").length;
  const lost = workspace.opportunities.filter((opportunity) => opportunity.outcome === "Lost").length;
  const averageDays = averageDaysToClose(workspace);

  return (
    <div className="dashboard-section">
      <KPIGrid>
        <MetricCard icon={<PieChart size={16} aria-hidden="true" />} label="Total de Oportunidades" value={String(total)} hint="Nesta sessão" tone="primary" />
        <MetricCard icon={<TrendingUp size={16} aria-hidden="true" />} label="Distribuição" value={`${open} abertas`} hint={`${won} ganhas · ${lost} perdidas`} tone="info" />
        <MetricCard icon={<Clock size={16} aria-hidden="true" />} label="Tempo médio até encerrar" value={averageDays === undefined ? "—" : `${averageDays.toFixed(1)} dia(s)`} hint={averageDays === undefined ? "Nenhuma Oportunidade encerrada ainda" : undefined} tone="neutral" />
      </KPIGrid>

      <WidgetCard title="Distribuição de Leads">
        <p>
          {workspace.leads.length} Lead(s) capturado(s), {workspace.convertedLeadIds.length} já convertido(s) nesta sessão.
        </p>
      </WidgetCard>

      <NotConnectedNotice fields={["Tendência histórica entre sessões", "Benchmark de mercado", "Previsão"]} context="CRM Hub" />
    </div>
  );
}
