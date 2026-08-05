import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Button } from "./Button";

export interface DrawerProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
}

/** Painel lateral padrão — fecha com Escape, nunca captura o foco de forma irreversível (WCAG 2.1.2). */
export function Drawer({ open, onClose, title, children }: DrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer__header">
          <h2>{title}</h2>
          <Button variant="ghost" size="sm" icon onClick={onClose} aria-label="Fechar">
            <X size={18} aria-hidden="true" />
          </Button>
        </div>
        <div className="drawer__body">{children}</div>
      </div>
    </>
  );
}
