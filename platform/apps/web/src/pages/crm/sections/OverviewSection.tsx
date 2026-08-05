import { Award, Handshake, Percent, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { LiveIndicator } from "@shared/components/ui/LiveIndicator";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { ProcessFlow, type ProcessFlowStep } from "@shared/components/ui/ProcessFlow";
import { useRecentlyChanged } from "@shared/hooks/useRecentlyChanged";
import { useBrandIdentity } from "@core/query/useBrandIdentity";
import { useBusinessProfileSummary } from "@core/query/useBusinessProfileSummary";
import type { CrmWorkspaceSnapshot } from "@core/crm/crmWorkspace";

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

function buildAcquisitionFlow(workspace: CrmWorkspaceSnapshot): readonly ProcessFlowStep[] {
  const totalLeads = workspace.leads.length;
  const qualified = workspace.leads.filter((lead) => lead.qualifiedAt !== undefined).length;
  const converted = workspace.customers.length;

  return [
    { id: "leads", label: "Leads", status: totalLeads > 0 ? "completed" : "current", detail: `${totalLeads}` },
    {
      id: "qualified",
      label: "Qualificados",
      status: totalLeads === 0 ? "pending" : qualified === totalLeads ? "completed" : qualified > 0 ? "current" : "pending",
      detail: totalLeads > 0 ? `${qualified} de ${totalLeads}` : undefined,
    },
    {
      id: "converted",
      label: "Convertidos em Cliente",
      status: totalLeads === 0 ? "pending" : converted > 0 ? "completed" : qualified > 0 ? "current" : "pending",
      detail: `${converted} Customer(s)`,
    },
  ];
}

/**
 * Visão Geral (FUN-103; `ProcessFlow`/`LiveIndicator` desde a UX-002) — Dashboard comercial
 * inteiramente real: todo KPI é derivado das próprias Oportunidades já acumuladas no CRM Workspace
 * desta sessão (nenhuma Query de listagem existe em `CRMManager` — ver relatório da Sprint), nunca
 * uma amostra maior ou uma tendência histórica. "Integração" (per instrução explícita desta
 * Sprint): Segmento do Business Profile e Tema do Branding Hub, ambos somente leitura, através dos
 * mesmos hooks já reais desde a FUN-101/FUN-102 — nenhuma dependência nova criada.
 *
 * `ProcessFlow` (UX-002) resume a jornada real de aquisição — Leads → Qualificados → Convertidos —
 * segunda aplicação do componente (a primeira foi o Supplier Workspace, IMP-205/UX-002),
 * confirmando sua reutilização genuína entre dois domínios distintos, per instrução explícita
 * ("Nunca criar componentes exclusivos de uma única tela"). `LiveIndicator` acende quando
 * `workspace.dataUpdatedAt` (React Query, timestamp real de cada `setQueryData` de Mutation) muda.
 */
export function OverviewSection({ workspace, profileId, tenantId, dataUpdatedAt }: { readonly workspace: CrmWorkspaceSnapshot; readonly profileId: string; readonly tenantId: string; readonly dataUpdatedAt: number }) {
  const profileSummary = useBusinessProfileSummary(profileId);
  const brandIdentity = useBrandIdentity(tenantId);
  const justUpdated = useRecentlyChanged(dataUpdatedAt);

  const won = workspace.opportunities.filter((opportunity) => opportunity.outcome === "Won");
  const lost = workspace.opportunities.filter((opportunity) => opportunity.outcome === "Lost");
  const open = workspace.opportunities.filter((opportunity) => opportunity.outcome === "Open");
  const openValue = open.reduce((total, opportunity) => total + opportunity.value, 0);
  const closed = won.length + lost.length;
  const conversion = closed === 0 ? undefined : (won.length / closed) * 100;

  return (
    <div className="dashboard-section">
      <WidgetCard title="Fluxo de Aquisição">
        <ProcessFlow label="Progresso de aquisição de Cliente" steps={buildAcquisitionFlow(workspace)} />
      </WidgetCard>

      <KPIGrid>
        <MetricCard icon={<Handshake size={16} aria-hidden="true" />} label="Oportunidades" value={String(workspace.opportunities.length)} tone="primary" />
        <MetricCard icon={<TrendingUp size={16} aria-hidden="true" />} label="Negócios ganhos" value={String(won.length)} tone="success" />
        <MetricCard icon={<TrendingDown size={16} aria-hidden="true" />} label="Negócios perdidos" value={String(lost.length)} tone="danger" />
        <MetricCard icon={<Wallet size={16} aria-hidden="true" />} label="Valor em negociação" value={formatCurrency(openValue)} hint={`${open.length} em aberto`} tone="info" />
        <MetricCard icon={<Percent size={16} aria-hidden="true" />} label="Conversão" value={conversion === undefined ? "—" : `${conversion.toFixed(0)}%`} hint={closed === 0 ? "Nenhum negócio encerrado ainda" : `${won.length} de ${closed} encerrados`} tone="primary" />
      </KPIGrid>
      {justUpdated && <LiveIndicator />}

      <div className="dashboard-grid">
        <WidgetCard title="Perfil Empresarial (somente leitura)">
          <p>
            Segmento: <strong>{profileSummary.data?.classification?.segment ?? "—"}</strong>
          </p>
          <p>
            Maturidade: <strong>{profileSummary.data?.maturity ?? "—"}</strong>
          </p>
        </WidgetCard>

        <WidgetCard title="Branding (somente leitura)">
          <p className="component-gallery-row">
            <Award size={16} aria-hidden="true" /> Tema ativo: <strong>{brandIdentity.data?.theme ? `Versão ${brandIdentity.data.theme.version}` : "—"}</strong>
          </p>
        </WidgetCard>
      </div>
    </div>
  );
}
