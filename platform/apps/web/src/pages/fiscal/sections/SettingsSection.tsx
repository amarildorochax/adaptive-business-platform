import { Moon, Sun } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useTheme } from "@core/theme/useTheme";

/**
 * Configurações (IMP-605) — nenhuma preferência de domínio existe em `FiscalManager` (Série padrão de
 * numeração, Regime Tributário padrão de exibição — nenhum desses foi modelado no Core, IMP-601); a
 * única preferência genuinamente real é o tema claro/escuro, mesma disciplina honesta de
 * `SettingsSection.tsx` do Production/Inventory Movement/Purchase/Supplier Workspace.
 */
export function SettingsSection() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="dashboard-section">
      <WidgetCard title="Aparência">
        <p>Tema atual: {theme === "dark" ? "Escuro" : "Claro"}</p>
        <Button type="button" variant="secondary" leadingIcon={theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />} onClick={toggleTheme}>
          Alternar para tema {theme === "dark" ? "claro" : "escuro"}
        </Button>
      </WidgetCard>

      <NotConnectedNotice fields={["Série padrão de numeração de Documento Fiscal", "Regime Tributário padrão exibido"]} context="Fiscal Hub" />
    </div>
  );
}
