import { Moon, Sun } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useTheme } from "@core/theme/useTheme";

/**
 * Configurações (IMP-305) — nenhuma preferência de domínio existe em `PurchaseManager` (teto de
 * aprovação padrão por Tenant, prazo de recebimento padrão, Fornecedor preferencial por categoria —
 * nenhum desses foi modelado no Core, IMP-301; `ApprovalThreshold` é sempre parâmetro explícito do
 * chamador, nunca lido de uma configuração armazenada, per `ApprovalThreshold.ts`); a única
 * preferência genuinamente real é o tema claro/escuro, mesma disciplina honesta de
 * `SettingsSection.tsx` do Supplier Workspace (IMP-205) — um novo componente, não um reuso, porque o
 * `NotConnectedNotice` precisa citar campos e contexto específicos do Purchase Hub.
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

      <NotConnectedNotice fields={["Teto de aprovação padrão por Tenant", "Prazo de recebimento padrão", "Fornecedor preferencial por categoria"]} context="Purchase Hub" />
    </div>
  );
}
