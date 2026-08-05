import { WidgetCard } from "@shared/components/WidgetCard";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useProfileDraft } from "@core/businessProfile/useProfileDraft";
import { DraftSavedIndicator } from "@shared/components/ui/DraftSavedIndicator";

interface CustomersDraft extends Record<string, unknown> {
  readonly targetAudience: string;
  readonly mainPersona: string;
  readonly ageRange: string;
  readonly economicClass: string;
  readonly painPoints: string;
  readonly desires: string;
  readonly objections: string;
}

const INITIAL_DRAFT: CustomersDraft = { targetAudience: "", mainPersona: "", ageRange: "", economicClass: "", painPoints: "", desires: "", objections: "" };

/**
 * Clientes (FUN-101) — nenhum campo estratégico de Cliente/Persona existe no Modelo de Perfil
 * implementado (`BUSINESS_PROFILE_ENGINE_CORE_MIGRATION_REPORT.md`, Seção 8: apenas Segmento/
 * Subsegmento/Maturidade estão no escopo curto-prazo). Rascunho local.
 */
export function CustomersSection() {
  const draft = useProfileDraft<CustomersDraft>("customers", INITIAL_DRAFT);

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Público-alvo", "Persona principal", "Faixa etária", "Classe econômica", "Principais dores", "Principais desejos", "Objeções"]} />

      <WidgetCard title="Público e Persona">
        <div className="form-grid">
          <Field label="Público-alvo" value={draft.value.targetAudience} onChange={(event) => draft.updateField("targetAudience", event.target.value)} />
          <Field label="Persona principal" value={draft.value.mainPersona} onChange={(event) => draft.updateField("mainPersona", event.target.value)} />
          <Field label="Faixa etária" value={draft.value.ageRange} onChange={(event) => draft.updateField("ageRange", event.target.value)} placeholder="Ex.: 25–45 anos" />
          <Field label="Classe econômica" value={draft.value.economicClass} onChange={(event) => draft.updateField("economicClass", event.target.value)} placeholder="Ex.: B/C" />
        </div>
      </WidgetCard>

      <WidgetCard title="Dores, desejos e objeções">
        <div className="form-grid">
          <Field label="Principais dores" value={draft.value.painPoints} onChange={(event) => draft.updateField("painPoints", event.target.value)} />
          <Field label="Principais desejos" value={draft.value.desires} onChange={(event) => draft.updateField("desires", event.target.value)} />
          <Field label="Objeções" value={draft.value.objections} onChange={(event) => draft.updateField("objections", event.target.value)} />
        </div>
        <DraftSavedIndicator savedAt={draft.savedAt} onClear={draft.resetDraft} />
      </WidgetCard>
    </div>
  );
}
