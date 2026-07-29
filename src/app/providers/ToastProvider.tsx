// ToastProvider.tsx
//
// Responsabilidade:
// Provider global de mensagens efêmeras (toast), com dispensa automática
// por tempo. Estado puramente de UI — nenhuma chamada ao Core, nenhuma
// integração com `@/core/notifications` (Notification Hub, domínio de
// negócio). Renderiza usando o componente `Toast` do Adaptive Design
// System (Sprint 26).

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Toast } from '@/design-system/components';
import type { ComponentVariant } from '@/design-system/types';

export interface ToastOptions {
  message: string;
  variant?: ComponentVariant;
  duration?: number;
}

interface ToastEntry extends ToastOptions {
  id: string;
}

export interface ToastContextValue {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export interface ToastProviderProps {
  children?: ReactNode;
}

export function ToastProvider(props: ToastProviderProps) {
  const { children } = props;
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, ...options }]);
      window.setTimeout(() => dismissToast(id), options.duration ?? 4000);
      return id;
    },
    [dismissToast],
  );

  const value = useMemo<ToastContextValue>(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite">
        {toasts.map((toast) => (
          <Toast key={toast.id} id={toast.id} message={toast.message} variant={toast.variant} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um <ToastProvider>.');
  }
  return context;
}
