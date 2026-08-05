import { Moon, Sun } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useTheme } from "@core/theme/useTheme";

/**
 * Configurações (IMP-205) — nenhuma preferência de domínio existe em `SupplierManager` (alçada de
 * aprovação, prazo de pagamento padrão, Fornecedor preferencial por categoria — nenhum desses foi
 * modelado no Core, IMP-201); a única preferência genuinamente real é o tema claro/escuro, mesma
 * disciplina honesta já usada por toda Sprint anterior desde a FUN-101. Não reaproveita
 * `pages/product-hub/sections/SettingsSection.tsx` (Purchase, FUN-106, reaproveitou) porque o
 * `NotConnectedNotice` daquele componente já cita campos e contexto específicos do Commerce Hub —
 * reaproveitá-lo aqui atribuiria incorretamente uma lacuna do Commerce Hub ao Supplier Hub.
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

      <NotConnectedNotice fields={["Alçada de aprovação", "Prazo de pagamento padrão", "Fornecedor preferencial por categoria"]} context="Supplier Hub" />
    </div>
  );
}
