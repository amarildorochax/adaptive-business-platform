import { Moon, Sun } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useTheme } from "@core/theme/useTheme";
import { useProfileDraft } from "@core/businessProfile/useProfileDraft";
import { DraftSavedIndicator } from "@shared/components/ui/DraftSavedIndicator";

interface SettingsDraft extends Record<string, unknown> {
  readonly language: string;
  readonly currency: string;
  readonly timezone: string;
  readonly preferences: string;
}

const INITIAL_DRAFT: SettingsDraft = { language: "", currency: "", timezone: "", preferences: "" };

/**
 * Configurações (FUN-101) — o Localization Engine (Idioma/Moeda) e o Preferences Engine, nomeados no
 * Capítulo 7 de `BUSINESS_PROFILE_ENGINE.md`, estão fora do escopo curto-prazo (Seção 8 do relatório
 * de migração). A única preferência genuinamente real e funcional disponível hoje é o tema
 * claro/escuro da aplicação (`core/theme/`, UX-001) — uma preferência de UI do navegador, não do
 * Tenant/Business Profile, mas reutilizada aqui honestamente em vez de inventar uma "preferência de
 * tema" nova e paralela.
 */
export function SettingsSection() {
  const { theme, toggleTheme } = useTheme();
  const draft = useProfileDraft<SettingsDraft>("settings", INITIAL_DRAFT);

  return (
    <div className="dashboard-section">
      <WidgetCard title="Aparência">
        <p>Tema atual: {theme === "dark" ? "Escuro" : "Claro"}</p>
        <Button type="button" variant="secondary" leadingIcon={theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />} onClick={toggleTheme}>
          Alternar para tema {theme === "dark" ? "claro" : "escuro"}
        </Button>
      </WidgetCard>

      <NotConnectedNotice fields={["Idioma", "Moeda", "Fuso horário", "Preferências"]} />

      <WidgetCard title="Localização e preferências (rascunho local)">
        <div className="form-grid">
          <Field label="Idioma" value={draft.value.language} onChange={(event) => draft.updateField("language", event.target.value)} placeholder="Ex.: Português (Brasil)" />
          <Field label="Moeda" value={draft.value.currency} onChange={(event) => draft.updateField("currency", event.target.value)} placeholder="Ex.: BRL" />
          <Field label="Fuso horário" value={draft.value.timezone} onChange={(event) => draft.updateField("timezone", event.target.value)} placeholder="Ex.: America/Sao_Paulo" />
          <Field label="Preferências" value={draft.value.preferences} onChange={(event) => draft.updateField("preferences", event.target.value)} />
        </div>
        <DraftSavedIndicator savedAt={draft.savedAt} onClear={draft.resetDraft} />
      </WidgetCard>
    </div>
  );
}
