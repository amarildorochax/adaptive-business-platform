// notifications.mock.ts
//
// Responsabilidade:
// Dado simulado do widget "Notifications". Não confundir com
// `@/app/providers/NotificationProvider` (Sprint 27, estado de UI) nem
// com `@/core/notifications` (Notification Hub, negócio) — este widget
// apenas exibe uma lista mock, sem conexão com nenhum dos dois.

export interface NotificationItem {
  id: string;
  title: string;
  read: boolean;
  createdAt: string;
}

export function generateNotifications(): NotificationItem[] {
  return [
    { id: 'n1', title: 'Novo lead atribuído a você', read: false, createdAt: '2026-07-28T10:05:00Z' },
    { id: 'n2', title: 'Meta mensal atingida em 82%', read: false, createdAt: '2026-07-28T07:20:00Z' },
    { id: 'n3', title: 'Backup semanal concluído', read: true, createdAt: '2026-07-27T22:00:00Z' },
  ];
}
