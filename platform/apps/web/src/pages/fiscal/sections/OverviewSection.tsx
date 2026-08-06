import { Calculator, ClipboardCheck, FileCheck2, Landmark, Percent } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { LiveIndicator } from "@shared/components/ui/LiveIndicator";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { ProcessFlow, type ProcessFlowStep } from "@shared/components/ui/ProcessFlow";
import { TaxRegimeCard } from "@shared/components/ui/TaxRegimeCard";
import { useRecentlyChanged } from "@shared/hooks/useRecentlyChanged";
import type { TaxRegimeResponseDto } from "@core/fiscal/fiscal.dto";

function stepStatus(hasHere: boolean, hasAhead: boolean): ProcessFlowStep["status"] {
  if (hasAhead) {
    return "completed";
  }
  return hasHere ? "current" : "pending";
}

/**
 * Constrói o funil "Regime Registrado → Regra Criada → Imposto Calculado → Documento Emitido" a partir
 * exclusivamente de atividade real desta sessão do navegador (mais o Tax Regime real, tenant-wide) — a
 * única fonte disponível, já que nenhuma Query tenant-wide de listagem completa existe para
 * `TaxRule`/`FiscalDocument` (`fiscalSections.ts`).
 *
 * Cada passo é a dependência causal real do próximo, exatamente como o Core exige (`FISCAL_HUB.md`,
 * Capítulo 10-11): uma `TaxRule` exige um `TaxRegime` já registrado; `CalculateTax` exige uma `TaxRule`
 * vigente; `IssueFiscalDocument` exige um `TaxCalculation` já aplicado a cada linha. **`FiscalObligation`
 * nunca é uma etapa deste funil** — é um Aggregate estruturalmente independente (obrigação acessória
 * periódica, sem nenhuma dependência causal do ciclo de emissão de documento, `FISCAL_HUB.md`, Capítulo
 * 4), representado exclusivamente por seus próprios KPIs/Cards na seção "Obrigações Acessórias", nunca
 * encadeado artificialmente aqui — mesma disciplina de nunca inventar uma sequência que o domínio não
 * possui, já aplicada por `buildProductionFlow` (Production Workspace, IMP-505) ao excluir `Cancelled`.
 */
function buildFiscalFlow(hasTaxRegime: boolean, taxRulesCount: number, taxCalculationsCount: number, fiscalDocumentsCount: number): readonly ProcessFlowStep[] {
  const pastRegime = taxRulesCount > 0 || taxCalculationsCount > 0 || fiscalDocumentsCount > 0;
  const pastRule = taxCalculationsCount > 0 || fiscalDocumentsCount > 0;
  const pastCalculation = fiscalDocumentsCount > 0;

  return [
    { id: "regime", label: "Regime Registrado", status: stepStatus(hasTaxRegime, pastRegime), detail: hasTaxRegime ? "Registrado" : "Não registrado" },
    { id: "regra", label: "Regra Criada", status: stepStatus(taxRulesCount > 0, pastRule), detail: `${taxRulesCount} regra(s)` },
    { id: "calculo", label: "Imposto Calculado", status: stepStatus(taxCalculationsCount > 0, pastCalculation), detail: `${taxCalculationsCount} cálculo(s)` },
    { id: "documento", label: "Documento Emitido", status: fiscalDocumentsCount > 0 ? "completed" : "pending", detail: `${fiscalDocumentsCount} documento(s)` },
  ];
}

/**
 * Visão Geral (IMP-605; `ProcessFlow`/`LiveIndicator` desde a UX-002) — painel operacional real.
 * Nenhuma Query tenant-wide de listagem completa existe para `TaxRule`/`FiscalDocument`/
 * `FiscalObligation` neste Hub (`fiscalSections.ts`) — os KPIs de atividade e o `ProcessFlow` refletem
 * majoritariamente esta sessão do navegador, mesmo princípio já usado por `OverviewSection.tsx` do
 * Production Workspace diante da mesma ausência real de Query. "Regime Tributário" é o único KPI
 * genuinamente tenant-wide (`useTaxRegime`, real, `dataUpdatedAt` real) — a única Query de topo deste
 * Workspace (`FiscalPage.tsx`).
 *
 * `taxRegime` pode legitimamente ser `undefined` sem ser um erro — "ainda não registrado" é um estado
 * de negócio honesto, nunca tratado como ausência de dado a esconder (mesmo formato de
 * `undefinedOn404`, `core/fiscal/fiscalClient.ts`, IMP-604).
 */
export function OverviewSection({
  taxRegime,
  dataUpdatedAt,
  taxRulesCount,
  taxCalculationsCount,
  fiscalDocumentsCount,
  fiscalObligationsRegisteredCount,
}: {
  readonly taxRegime: TaxRegimeResponseDto | undefined;
  readonly dataUpdatedAt: number;
  readonly taxRulesCount: number;
  readonly taxCalculationsCount: number;
  readonly fiscalDocumentsCount: number;
  readonly fiscalObligationsRegisteredCount: number;
}) {
  const justUpdated = useRecentlyChanged(dataUpdatedAt);
  const flow = buildFiscalFlow(taxRegime !== undefined, taxRulesCount, taxCalculationsCount, fiscalDocumentsCount);

  return (
    <div className="dashboard-section">
      <WidgetCard title="Fluxo Fiscal">
        <ProcessFlow label="Progresso da conformidade fiscal nesta sessão" steps={flow} />
      </WidgetCard>

      <KPIGrid>
        <MetricCard label="Regime Tributário" value={taxRegime ? "Registrado" : "Não registrado"} icon={<Landmark size={16} aria-hidden="true" />} tone={taxRegime ? "success" : "neutral"} />
        <MetricCard label="Regras Fiscais criadas nesta sessão" value={String(taxRulesCount)} icon={<Percent size={16} aria-hidden="true" />} tone="info" />
        <MetricCard label="Cálculos de imposto realizados nesta sessão" value={String(taxCalculationsCount)} icon={<Calculator size={16} aria-hidden="true" />} tone="primary" />
        <MetricCard label="Documentos Fiscais emitidos nesta sessão" value={String(fiscalDocumentsCount)} icon={<FileCheck2 size={16} aria-hidden="true" />} tone="warning" />
        <MetricCard label="Obrigações Acessórias registradas nesta sessão" value={String(fiscalObligationsRegisteredCount)} icon={<ClipboardCheck size={16} aria-hidden="true" />} tone="neutral" />
      </KPIGrid>
      {justUpdated && <LiveIndicator />}

      <WidgetCard title="Regime Tributário">
        {taxRegime ? (
          <div className="dashboard-grid">
            <TaxRegimeCard taxRegimeId={taxRegime.taxRegimeId} tenantId={taxRegime.tenantId} name={taxRegime.name} createdAt={taxRegime.createdAt} />
          </div>
        ) : (
          <EmptyState title="Nenhum Regime Tributário registrado ainda" description="Registre o Regime Tributário na aba 'Regime & Regras Fiscais' — obrigatório antes de criar qualquer Tax Rule." />
        )}
      </WidgetCard>
    </div>
  );
}
