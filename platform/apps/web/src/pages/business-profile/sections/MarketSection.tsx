import { AsyncState } from "@shared/components/AsyncState";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useBusinessProfileSummary } from "@core/query/useBusinessProfileSummary";
import { useProfileDraft } from "@core/businessProfile/useProfileDraft";
import { DraftSavedIndicator } from "@shared/components/ui/DraftSavedIndicator";

interface MarketDraft extends Record<string, unknown> {
  readonly niche: string;
  readonly operatingArea: string;
  readonly servedRegion: string;
  readonly businessModel: string;
  readonly competitors: string;
  readonly differentiators: string;
}

const INITIAL_DRAFT: MarketDraft = { niche: "", operatingArea: "", servedRegion: "", businessModel: "", competitors: "", differentiators: "" };

/**
 * Mercado (FUN-101) — híbrida: Segmento/Subsegmento são reais e somente leitura (`BusinessProfileManager`
 * nunca expôs um endpoint de reclassificação — apenas `currentClassification`, definido uma única vez em
 * `createBusinessProfile`); os demais campos pedidos pela Sprint (Nicho, Área de atuação, Região
 * atendida, Modelo de negócio, Concorrentes, Diferenciais) não existem em nenhum Manager — Channel
 * Manager/Segment Engine avançado são "médio prazo" per `BUSINESS_PROFILE_ENGINE.md`, Capítulo 21 —
 * mantidos como rascunho local (`NotConnectedNotice`).
 */
export function MarketSection({ profileId }: { readonly profileId: string }) {
  const summary = useBusinessProfileSummary(profileId);
  const draft = useProfileDraft<MarketDraft>("market", INITIAL_DRAFT);

  return (
    <div className="dashboard-section">
      <AsyncState isLoading={summary.isLoading} isError={summary.isError} error={summary.error} onRetry={() => void summary.refetch()}>
        <WidgetCard title="Classificação de Mercado">
          <div className="form-grid">
            <Field label="Segmento" value={summary.data?.classification?.segment ?? ""} readOnly disabled />
            <Field label="Subsegmento" value={summary.data?.classification?.subsegment ?? "—"} readOnly disabled />
          </div>
        </WidgetCard>
      </AsyncState>

      <NotConnectedNotice fields={["Nicho", "Área de atuação", "Região atendida", "Modelo de negócio", "Concorrentes", "Diferenciais"]} />

      <WidgetCard title="Mercado — detalhes (rascunho local)">
        <div className="form-grid">
          <Field label="Nicho" value={draft.value.niche} onChange={(event) => draft.updateField("niche", event.target.value)} placeholder="Ex.: floricultura para eventos corporativos" />
          <Field label="Área de atuação" value={draft.value.operatingArea} onChange={(event) => draft.updateField("operatingArea", event.target.value)} />
          <Field label="Região atendida" value={draft.value.servedRegion} onChange={(event) => draft.updateField("servedRegion", event.target.value)} />
          <Field label="Modelo de negócio" value={draft.value.businessModel} onChange={(event) => draft.updateField("businessModel", event.target.value)} placeholder="Ex.: B2B, B2C, marketplace" />
          <Field label="Concorrentes" value={draft.value.competitors} onChange={(event) => draft.updateField("competitors", event.target.value)} />
          <Field label="Diferenciais" value={draft.value.differentiators} onChange={(event) => draft.updateField("differentiators", event.target.value)} />
        </div>
        <DraftSavedIndicator savedAt={draft.savedAt} onClear={draft.resetDraft} />
      </WidgetCard>
    </div>
  );
}
