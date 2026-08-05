import { WidgetCard } from "@shared/components/WidgetCard";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useProfileDraft } from "@core/businessProfile/useProfileDraft";
import { DraftSavedIndicator } from "@shared/components/ui/DraftSavedIndicator";

interface PositioningDraft extends Record<string, unknown> {
  readonly mission: string;
  readonly vision: string;
  readonly values: string;
  readonly toneOfVoice: string;
  readonly archetype: string;
  readonly personality: string;
  readonly promise: string;
  readonly valueProposition: string;
}

const INITIAL_DRAFT: PositioningDraft = { mission: "", vision: "", values: "", toneOfVoice: "", archetype: "", personality: "", promise: "", valueProposition: "" };

/**
 * Posicionamento (FUN-101) — Missão/Visão/Valores/Tom de voz/Arquétipo pertencem, na arquitetura de
 * referência, à identidade de marca do Branding Hub (`BUSINESS_PROFILE_ENGINE.md`, Capítulo 14: "O
 * Business Profile Engine não gera nem armazena nenhum elemento de identidade visual... a integração
 * acontece em uma única direção... o Branding Hub nunca informa de volta"), e `BrandingManager` (já
 * conectado, FUN-005) também não expõe estes campos qualitativos — apenas paleta/tipografia/logo.
 * Nenhum dos dois Managers os modela. Rascunho local.
 */
export function PositioningSection() {
  const draft = useProfileDraft<PositioningDraft>("positioning", INITIAL_DRAFT);

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Missão", "Visão", "Valores", "Tom de voz", "Arquétipo", "Personalidade", "Promessa", "Proposta de valor"]} />

      <WidgetCard title="Identidade estratégica">
        <div className="form-grid">
          <Field label="Missão" value={draft.value.mission} onChange={(event) => draft.updateField("mission", event.target.value)} />
          <Field label="Visão" value={draft.value.vision} onChange={(event) => draft.updateField("vision", event.target.value)} />
          <Field label="Valores" value={draft.value.values} onChange={(event) => draft.updateField("values", event.target.value)} />
        </div>
      </WidgetCard>

      <WidgetCard title="Voz e promessa">
        <div className="form-grid">
          <Field label="Tom de voz" value={draft.value.toneOfVoice} onChange={(event) => draft.updateField("toneOfVoice", event.target.value)} />
          <Field label="Arquétipo" value={draft.value.archetype} onChange={(event) => draft.updateField("archetype", event.target.value)} />
          <Field label="Personalidade" value={draft.value.personality} onChange={(event) => draft.updateField("personality", event.target.value)} />
          <Field label="Promessa" value={draft.value.promise} onChange={(event) => draft.updateField("promise", event.target.value)} />
          <Field label="Proposta de valor" value={draft.value.valueProposition} onChange={(event) => draft.updateField("valueProposition", event.target.value)} />
        </div>
        <DraftSavedIndicator savedAt={draft.savedAt} onClear={draft.resetDraft} />
      </WidgetCard>
    </div>
  );
}
