import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { ToastContext, type ToastTone } from "./toastContextInstance";

interface ActiveToast {
  readonly id: string;
  readonly tone: ToastTone;
  readonly message: string;
}

const AUTO_DISMISS_MS = 5000;
const ICONS: Record<ToastTone, typeof Info> = { success: CheckCircle2, danger: XCircle, info: Info };

/** Único Provider de notificações Toast de toda a aplicação — dispensa automaticamente após 5s, nunca se acumula indefinidamente. */
export function ToastProvider({ children }: { readonly children: ReactNode }) {
  const [toasts, setToasts] = useState<readonly ActiveToast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((tone: ToastTone, message: string) => {
    const id = `toast-${nextId.current++}`;
    setToasts((current) => [...current, { id, tone, message }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), AUTO_DISMISS_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.tone];
          return (
            <div key={toast.id} className={`toast toast--${toast.tone}`} role="status">
              <Icon size={18} className="toast__icon" aria-hidden="true" />
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
