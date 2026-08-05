import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ReactNode } from "react";

export type AlertTone = "info" | "success" | "warning" | "danger";

export interface AlertProps {
  readonly tone: AlertTone;
  readonly children: ReactNode;
  readonly role?: "alert" | "status";
}

const ICONS: Record<AlertTone, typeof Info> = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: XCircle };

/** Mensagem de estado (erro/sucesso/aviso/informação) — única forma de exibir feedback textual de resultado em toda a aplicação. */
export function Alert({ tone, children, role = tone === "danger" || tone === "warning" ? "alert" : "status" }: AlertProps) {
  const Icon = ICONS[tone];

  return (
    <div className={`alert alert--${tone}`} role={role}>
      <Icon size={18} className="alert__icon" aria-hidden="true" />
      <div className="alert__content">{children}</div>
    </div>
  );
}
