// NotificationsWidget.tsx
//
// Responsabilidade:
// Widget mock "Notifications" — lista de notificações in-app. Dado
// 100% simulado (`mocks/notifications.mock`); nenhum acesso ao Core.
// Não confundir com `@/app/providers/NotificationProvider` (Sprint 27)
// nem com `@/core/notifications` (negócio) — widget de exibição apenas.

import { WidgetFrame } from '../../components';
import { Badge } from '@/design-system/components';
import { Stack, Flex, Text } from '@/app/primitives';
import type { WidgetDefinition, WidgetState } from '../../types';
import type { NotificationItem } from '../../mocks';

export const notificationsDefinition: WidgetDefinition = {
  id: 'notifications',
  title: 'Notificações',
  description: 'Notificações recentes da plataforma.',
  icon: 'warning',
  size: 'md',
  position: { x: 0, y: 2, w: 4, h: 2 },
  permissions: {},
  refreshPolicy: { mode: 'interval', intervalMs: 30000 },
};

export interface NotificationsWidgetProps {
  state: WidgetState<NotificationItem[]>;
  onRefresh: () => void;
}

export function NotificationsWidget(props: NotificationsWidgetProps) {
  const { state, onRefresh } = props;

  return (
    <WidgetFrame definition={notificationsDefinition} state={state} onRefresh={onRefresh}>
      <Stack gap={8}>
        {(state.data ?? []).map((notification) => (
          <Flex key={notification.id} justify="space-between" align="center">
            <Text variant="caption">{notification.title}</Text>
            {!notification.read && <Badge variant="info">novo</Badge>}
          </Flex>
        ))}
      </Stack>
    </WidgetFrame>
  );
}
