import { Moon, Sun } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useTheme } from "@core/theme/useTheme";

/**
 * Configurações (IMP-505) — nenhuma preferência de domínio existe em `ProductionManager` (Centro de
 * Trabalho padrão, Unidade de medida padrão — nenhum desses foi modelado no Core, IMP-501); a única
 * preferência genuinamente real é o tema claro/escuro, mesma disciplina honesta de
 * `SettingsSection.tsx` do Inventory Movement/Purchase/Supplier Workspace.
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

      <NotConnectedNotice fields={["Centro de Trabalho padrão por Tenant", "Unidade de medida padrão"]} context="Production Hub" />
    </div>
  );
}
