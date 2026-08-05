import { useEffect, useRef, useState, type ReactNode } from "react";

export interface DropdownTriggerProps {
  readonly onClick: () => void;
  readonly "aria-expanded": boolean;
  readonly "aria-haspopup": "menu";
}

export interface DropdownMenuProps {
  readonly trigger: (props: DropdownTriggerProps) => ReactNode;
  readonly panelLabel: string;
  readonly children: ReactNode;
}

/**
 * Menu suspenso genérico (Notificações/Ações Rápidas/Perfil na `Topbar`) — fecha ao clicar fora ou
 * pressionar Escape, `role="menu"` no painel (WCAG — foco/teclado nunca sacrificado pela estética).
 */
export function DropdownMenu({ trigger, panelLabel, children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="dropdown" ref={containerRef}>
      {trigger({ onClick: () => setOpen((current) => !current), "aria-expanded": open, "aria-haspopup": "menu" })}
      {open && (
        <div className="dropdown__panel" role="menu" aria-label={panelLabel}>
          {children}
        </div>
      )}
    </div>
  );
}
