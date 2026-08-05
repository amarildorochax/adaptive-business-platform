import { WidgetCard } from "@shared/components/WidgetCard";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useProfileDraft } from "@core/businessProfile/useProfileDraft";
import { DraftSavedIndicator } from "@shared/components/ui/DraftSavedIndicator";

interface GoalsDraft extends Record<string, unknown> {
  readonly annualGoals: string;
  readonly targets: string;
  readonly kpis: string;
  readonly indicators: string;
}

const INITIAL_DRAFT: GoalsDraft = { annualGoals: "", targets: "", kpis: "", indicators: "" };

/**
 * Objetivos (FUN-101) — o Goals Engine é nomeado no Capítulo 7 de `BUSINESS_PROFILE_ENGINE.md`, mas
 * `BUSINESS_PROFILE_ENGINE_CORE_MIGRATION_REPORT.md`, Seção 8, o lista explicitamente fora do escopo
 * curto-prazo ("nenhum campo correspondente... Objetivos... foi adicionado"). Rascunho local.
 */
export function GoalsSection() {
  const draft = useProfileDraft<GoalsDraft>("goals", INITIAL_DRAFT);

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Objetivos anuais", "Metas", "KPIs", "Indicadores"]} />

      <WidgetCard title="Objetivos e metas">
        <div className="form-grid">
          <Field label="Objetivos anuais" value={draft.value.annualGoals} onChange={(event) => draft.updateField("annualGoals", event.target.value)} />
          <Field label="Metas" value={draft.value.targets} onChange={(event) => draft.updateField("targets", event.target.value)} />
          <Field label="KPIs" value={draft.value.kpis} onChange={(event) => draft.updateField("kpis", event.target.value)} />
          <Field label="Indicadores" value={draft.value.indicators} onChange={(event) => draft.updateField("indicators", event.target.value)} />
        </div>
        <DraftSavedIndicator savedAt={draft.savedAt} onClear={draft.resetDraft} />
      </WidgetCard>
    </div>
  );
}
