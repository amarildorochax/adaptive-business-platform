// TimelineWidget.tsx
//
// Responsabilidade:
// Widget mock "Timeline" — marcos de projeto/onboarding. Dado 100%
// simulado; nenhum acesso ao Core.

import { WidgetFrame } from '../../components';
import { Stack, Flex, Text } from '@/app/primitives';
import type { WidgetDefinition, WidgetState } from '../../types';
import type { TimelineMilestone, TimelineMilestoneStatus } from '../../mocks';

export const timelineDefinition: WidgetDefinition = {
  id: 'timeline',
  title: 'Linha do Tempo',
  description: 'Marcos do projeto (simulado).',
  icon: 'chevron-right',
  size: 'md',
  position: { x: 0, y: 2, w: 4, h: 2 },
  permissions: {},
  refreshPolicy: { mode: 'manual' },
};

export interface TimelineWidgetProps {
  state: WidgetState<TimelineMilestone[]>;
  onRefresh: () => void;
}

const COLOR_BY_STATUS: Record<TimelineMilestoneStatus, string> = {
  done: 'var(--ads-color-solid-success)',
  current: 'var(--ads-color-solid-primary)',
  upcoming: 'var(--ads-color-border)',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function TimelineWidget(props: TimelineWidgetProps) {
  const { state, onRefresh } = props;

  return (
    <WidgetFrame definition={timelineDefinition} state={state} onRefresh={onRefresh}>
      <Stack gap={12}>
        {(state.data ?? []).map((milestone) => (
          <Flex key={milestone.id} align="flex-start" gap={8}>
            <span
              aria-hidden="true"
              style={{
                marginTop: 4,
                width: 10,
                height: 10,
                borderRadius: 'var(--ads-radius-full)',
                backgroundColor: COLOR_BY_STATUS[milestone.status],
                flexShrink: 0,
              }}
            />
            <div>
              <Text variant="caption" style={{ fontWeight: 600 }}>
                {milestone.title}
              </Text>
              <Text variant="caption" color="var(--ads-color-text-secondary)">
                {formatDate(milestone.date)}
              </Text>
            </div>
          </Flex>
        ))}
      </Stack>
    </WidgetFrame>
  );
}
