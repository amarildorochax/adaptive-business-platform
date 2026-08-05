import { Moon, Sun } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useTheme } from "@core/theme/useTheme";

/**
 * Configurações (FUN-103) — `Configuration Manager` (Pipeline/Stage/campo customizado por Empresa,
 * `CRM_HUB.md` Capítulo 7) nunca foi implementado; a única preferência genuinamente real e funcional
 * é o tema claro/escuro da aplicação (`core/theme/`, UX-001) — mesmo padrão honesto já usado por
 * Perfil Empresarial (FUN-101) e Branding (FUN-102) em vez de inventar uma preferência de CRM nova.
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

      <NotConnectedNotice fields={["Estrutura de Pipeline", "Vocabulário de Estágio", "Campos customizados"]} context="CRM Hub" />
    </div>
  );
}
