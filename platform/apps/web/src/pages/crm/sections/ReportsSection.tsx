import { Download } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import type { CrmWorkspaceSnapshot } from "@core/crm/crmWorkspace";

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

/**
 * Relatórios (FUN-103) — resumo em Cards/Indicadores dos mesmos dados reais já usados em Visão
 * Geral/Insights (nunca uma segunda fonte). "Exportação somente se existir endpoint" (instrução
 * explícita da Sprint): nenhum `Export Manager` real existe (`CRM_HUB.md`, Capítulo 7, catalogado
 * mas sem Service produtor) — a única exportação real possível é um download client-side do próprio
 * CRM Workspace já carregado, mesmo padrão já usado pela Exportação do Brand Center (FUN-102).
 */
export function ReportsSection({ workspace }: { readonly workspace: CrmWorkspaceSnapshot }) {
  const totalValue = workspace.opportunities.reduce((sum, opportunity) => sum + opportunity.value, 0);
  const wonValue = workspace.opportunities.filter((opportunity) => opportunity.outcome === "Won").reduce((sum, opportunity) => sum + opportunity.value, 0);

  function handleExport() {
    const payload = JSON.stringify(workspace, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "crm-workspace.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Resumo Comercial">
        <KPIGrid>
          <MetricCard label="Organizações" value={String(workspace.organizations.length)} tone="neutral" />
          <MetricCard label="Customers" value={String(workspace.customers.length)} tone="neutral" />
          <MetricCard label="Valor total em Oportunidades" value={formatCurrency(totalValue)} tone="primary" />
          <MetricCard label="Valor ganho" value={formatCurrency(wonValue)} tone="success" />
        </KPIGrid>
      </WidgetCard>

      <WidgetCard title="Exportar CRM Workspace (client-side)">
        <p>Baixa um arquivo <code>.json</code> com todo o CRM Workspace já carregado nesta sessão — nunca um relatório oficial gerado/rastreado pelo Backend.</p>
        <Button type="button" variant="secondary" leadingIcon={<Download size={16} aria-hidden="true" />} onClick={handleExport}>
          Baixar crm-workspace.json
        </Button>
      </WidgetCard>

      <NotConnectedNotice fields={["Relatório oficial (PDF)", "Exportação agendada"]} context="CRM Hub" />
    </div>
  );
}
