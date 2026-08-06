import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import type { FiscalDocumentResponseDto, TaxRuleResponseDto } from "@core/fiscal/fiscal.dto";

/**
 * Analytics (IMP-605) — "Mostrar somente métricas realmente disponíveis. Nunca calcular regras do Core
 * no Frontend." Nenhuma Query tenant-wide de listagem completa existe para `TaxRule`/`FiscalDocument`/
 * `FiscalObligation` (`fiscalSections.ts`) — todo indicador abaixo é uma agregação real, porém apenas
 * sobre a atividade desta sessão do navegador, nunca o histórico completo real da Empresa. Mesma
 * divergência já documentada por `AnalyticsSection.tsx` do Production Workspace diante da mesma
 * ausência real de arquitetura — por isso esta seção é marcada `hasRealData: false` em
 * `fiscalSections.ts`.
 *
 * **Nenhum valor monetário é somado aqui.** Contar quantos Documentos existem por tipo/status é uma
 * agregação honesta (contagem simples); somar `TaxCalculation.amount`/`FiscalDocumentLine.unitValue`
 * localmente reproduziria uma regra de negócio fora do Core (`FiscalPolicy.computeTaxAmount`), violando
 * a regra final desta Sprint ("Nenhuma regra de negócio poderá existir na interface") — mesma
 * disciplina de `AnalyticsSection.tsx` (Production Workspace) nunca recalculando
 * `totalConsumedCost`/`totalGeneratedQuantity` localmente.
 */
export function AnalyticsSection({
  taxRulesThisSession,
  fiscalDocumentsThisSession,
  taxCalculationsCount,
  fiscalObligationsRegisteredCount,
}: {
  readonly taxRulesThisSession: readonly TaxRuleResponseDto[];
  readonly fiscalDocumentsThisSession: readonly FiscalDocumentResponseDto[];
  readonly taxCalculationsCount: number;
  readonly fiscalObligationsRegisteredCount: number;
}) {
  const hasAnyData = taxRulesThisSession.length > 0 || fiscalDocumentsThisSession.length > 0 || taxCalculationsCount > 0 || fiscalObligationsRegisteredCount > 0;

  if (!hasAnyData) {
    return (
      <div className="dashboard-section">
        <EmptyState title="Nenhum dado ainda nesta sessão" description="Registre um Regime Tributário e emita um Documento Fiscal para ver indicadores." />
        <NotConnectedNotice fields={["Analytics tenant-wide (histórico completo)"]} context="Fiscal Hub (nenhuma Query tenant-wide de listagem completa existe neste domínio)" />
      </div>
    );
  }

  const activeRules = taxRulesThisSession.filter((rule) => rule.active).length;
  const inactiveRules = taxRulesThisSession.length - activeRules;
  const issuedDocuments = fiscalDocumentsThisSession.filter((doc) => doc.status === "Issued").length;
  const cancelledDocuments = fiscalDocumentsThisSession.filter((doc) => doc.status === "Cancelled").length;

  return (
    <div className="dashboard-section">
      <KPIGrid>
        <MetricCard label="Tax Rule ativas" value={String(activeRules)} tone="success" />
        <MetricCard label="Tax Rule desativadas" value={String(inactiveRules)} tone="neutral" />
        <MetricCard label="Documentos Emitidos" value={String(issuedDocuments)} tone="primary" />
        <MetricCard label="Documentos Cancelados" value={String(cancelledDocuments)} tone="danger" />
        <MetricCard label="Cálculos de imposto realizados" value={String(taxCalculationsCount)} tone="info" />
        <MetricCard label="Obrigações registradas" value={String(fiscalObligationsRegisteredCount)} tone="warning" />
      </KPIGrid>

      <WidgetCard title="Documentos por tipo (nesta sessão)">
        <ul className="activity-log-list">
          {["Sale", "Return", "Transfer"].map((type) => {
            const count = fiscalDocumentsThisSession.filter((doc) => doc.type === type).length;
            return (
              <li key={type}>
                <span>{type}</span>
                <span>{count} documento(s)</span>
              </li>
            );
          })}
        </ul>
      </WidgetCard>

      <NotConnectedNotice
        fields={["Analytics tenant-wide (histórico completo)", "Valor total de imposto calculado consolidado", "Taxa de conformidade de Obrigações Acessórias"]}
        context="Fiscal Hub (indicadores consolidados são exclusivos do Analytics Hub, per DOMAIN_OWNERSHIP_MATRIX.md — nunca calculados localmente)"
      />
    </div>
  );
}
