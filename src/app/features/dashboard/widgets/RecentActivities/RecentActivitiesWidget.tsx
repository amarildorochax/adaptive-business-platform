// RecentActivitiesWidget.tsx
//
// Responsabilidade:
// Widget mock "Recent Activities". Dado 100% simulado
// (`mocks/recentActivities.mock`); nenhum acesso ao Core.
//
// Sprint 31 (evolução visual — "Atividades"): reestilizado como um
// feed corporativo — avatar (`Avatar`, iniciais do autor) + ação +
// alvo, usando apenas componentes já existentes do Design System.

import { WidgetFrame } from '../../components';
import { Avatar } from '@/design-system/components';
import { Stack, Flex, Text } from '@/app/primitives';
import type { WidgetDefinition, WidgetState } from '../../types';
import type { ActivityItem } from '../../mocks';

export const recentActivitiesDefinition: WidgetDefinition = {
  id: 'recent-activities',
  title: 'Atividades Recentes',
  description: 'Últimas atividades registradas na plataforma.',
  icon: 'chevron-right',
  size: 'md',
  position: { x: 0, y: 3, w: 4, h: 2 },
  permissions: {},
  refreshPolicy: { mode: 'manual' },
};

export interface RecentActivitiesWidgetProps {
  state: WidgetState<ActivityItem[]>;
  onRefresh: () => void;
}

export function RecentActivitiesWidget(props: RecentActivitiesWidgetProps) {
  const { state, onRefresh } = props;

  return (
    <WidgetFrame definition={recentActivitiesDefinition} state={state} onRefresh={onRefresh}>
      <Stack gap={12}>
        {(state.data ?? []).map((activity) => (
          <Flex key={activity.id} align="flex-start" gap={8}>
            <Avatar name={activity.actor} size="sm" />
            <Text variant="caption">
              <strong>{activity.actor}</strong> {activity.action} <em>{activity.target}</em>
            </Text>
          </Flex>
        ))}
      </Stack>
    </WidgetFrame>
  );
}
