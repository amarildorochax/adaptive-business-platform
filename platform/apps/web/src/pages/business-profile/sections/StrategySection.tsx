import { WidgetCard } from "@shared/components/WidgetCard";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useProfileDraft } from "@core/businessProfile/useProfileDraft";
import { DraftSavedIndicator } from "@shared/components/ui/DraftSavedIndicator";

const CHANNELS = ["Instagram", "Facebook", "WhatsApp", "Google", "Site", "Marketplace", "Loja física"] as const;
type Channel = (typeof CHANNELS)[number];

interface StrategyDraft extends Record<string, unknown> {
  readonly channels: readonly Channel[];
}

const INITIAL_DRAFT: StrategyDraft = { channels: [] };

/**
 * Estratégia (FUN-101) — Canais é responsabilidade nomeada do Channel Manager
 * (`BUSINESS_PROFILE_ENGINE.md`, Capítulo 7), listado fora do escopo curto-prazo em
 * `BUSINESS_PROFILE_ENGINE_CORE_MIGRATION_REPORT.md`, Seção 8 ("nenhum campo correspondente...
 * Canais... foi adicionado"). Rascunho local — nenhum Canal aqui reflete o que `CommunicationManager`
 * já opera de fato (WhatsApp, no bootstrap de demonstração), para não confundir dado real com rascunho.
 */
export function StrategySection() {
  const draft = useProfileDraft<StrategyDraft>("strategy", INITIAL_DRAFT);

  function toggleChannel(channel: Channel) {
    const current = draft.value.channels;
    const next = current.includes(channel) ? current.filter((c) => c !== channel) : [...current, channel];
    draft.updateField("channels", next);
  }

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Canais utilizados"]} />

      <WidgetCard title="Canais utilizados">
        <div className="channel-grid">
          {CHANNELS.map((channel) => (
            <label key={channel} className="channel-option">
              <input type="checkbox" checked={draft.value.channels.includes(channel)} onChange={() => toggleChannel(channel)} />
              {channel}
            </label>
          ))}
        </div>
        <DraftSavedIndicator savedAt={draft.savedAt} onClear={draft.resetDraft} />
      </WidgetCard>
    </div>
  );
}
