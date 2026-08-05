import { Moon, Sun } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useTheme } from "@core/theme/useTheme";

/**
 * Configurações (FUN-104) — nenhum método de configuração existe em `CommerceManager` (unidade de
 * medida, moeda padrão, regras fiscais nunca foram modelados nesta Sprint do domínio); a única
 * preferência genuinamente real é o tema claro/escuro da aplicação (`core/theme/`, UX-001) — mesmo
 * padrão honesto já usado por Perfil Empresarial (FUN-101), Branding (FUN-102) e CRM (FUN-103).
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

      <NotConnectedNotice fields={["Unidade de medida padrão", "Moeda padrão", "Regras fiscais"]} context="Commerce Hub" />
    </div>
  );
}
