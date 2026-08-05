import { Check } from "lucide-react";
import { Button } from "./Button";
import { useToast } from "./toast/useToast";

export interface DraftSavedIndicatorProps {
  readonly savedAt: Date | undefined;
  readonly onClear: () => void;
}

/**
 * Indicador de autosave visual + ação de limpar rascunho — usado por toda seção com rascunho local
 * (primeiro uso em `pages/business-profile/sections/*`, FUN-101; generalizado para `shared/components/ui/`
 * na FUN-102 e reutilizado por `pages/branding/sections/*`).
 */
export function DraftSavedIndicator({ savedAt, onClear }: DraftSavedIndicatorProps) {
  const { showToast } = useToast();

  return (
    <div className="draft-indicator">
      <span className="draft-indicator__status">
        {savedAt ? (
          <>
            <Check size={14} aria-hidden="true" /> Rascunho salvo às {savedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </>
        ) : (
          "Nenhuma alteração ainda"
        )}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          onClear();
          showToast("info", "Rascunho local limpo.");
        }}
      >
        Limpar rascunho
      </Button>
    </div>
  );
}
