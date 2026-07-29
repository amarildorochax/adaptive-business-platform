// NotificationProvider.tsx
//
// Responsabilidade:
// Provider global do feed de notificações in-app persistentes (ex.:
// sino de notificações do Header) — distinto do `ToastProvider`
// (mensagens efêmeras com dispensa automática): aqui as entradas
// permanecem até serem lidas/removidas manualmente.
//
// Nota: puramente estado de UI. NÃO é o Notification Hub do Core
// (`@/core/notifications`, domínio de negócio) — nenhuma importação de
// `@/core` ocorre aqui, e nenhuma feature futura deve tratar este
// Provider como fonte de dados real; ele apenas exibe o que for
// explicitamente enviado via `notify()`.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ComponentVariant } from '@/design-system/types';

export interface AppNotification {
  id: string;
  title: string;
  description?: string;
  variant?: ComponentVariant;
  read: boolean;
}

export interface NotifyOptions {
  title: string;
  description?: string;
  variant?: ComponentVariant;
}

export interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  notify: (options: NotifyOptions) => string;
  markAsRead: (id: string) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export interface NotificationProviderProps {
  children?: ReactNode;
}

export function NotificationProvider(props: NotificationProviderProps) {
  const { children } = props;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const notify = useCallback((options: NotifyOptions) => {
    const id = crypto.randomUUID();
    setNotifications((prev) => [{ id, read: false, ...options }, ...prev]);
    return id;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => setNotifications([]), []);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  const value = useMemo<NotificationContextValue>(
    () => ({ notifications, unreadCount, notify, markAsRead, dismiss, clear }),
    [notifications, unreadCount, notify, markAsRead, dismiss, clear],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um <NotificationProvider>.');
  }
  return context;
}
