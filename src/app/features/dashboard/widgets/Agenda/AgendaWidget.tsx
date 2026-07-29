// AgendaWidget.tsx
//
// Responsabilidade:
// Widget mock "Agenda" — próximos compromissos. Dado 100% simulado
// (`mocks/agenda.mock`); nenhum acesso ao Core.

import { WidgetFrame } from '../../components';
import { Stack, Text } from '@/app/primitives';
import type { WidgetDefinition, WidgetState } from '../../types';
import type { AgendaEvent } from '../../mocks';

export const agendaDefinition: WidgetDefinition = {
  id: 'agenda',
  title: 'Agenda',
  description: 'Próximos compromissos.',
  icon: 'chevron-down',
  size: 'md',
  position: { x: 4, y: 2, w: 4, h: 2 },
  permissions: {},
  refreshPolicy: { mode: 'manual' },
};

export interface AgendaWidgetProps {
  state: WidgetState<AgendaEvent[]>;
  onRefresh: () => void;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function AgendaWidget(props: AgendaWidgetProps) {
  const { state, onRefresh } = props;

  return (
    <WidgetFrame definition={agendaDefinition} state={state} onRefresh={onRefresh}>
      <Stack gap={8}>
        {(state.data ?? []).map((event) => (
          <div key={event.id}>
            <Text variant="caption" style={{ fontWeight: 600 }}>
              {event.title}
            </Text>
            <Text variant="caption" color="var(--ads-color-text-secondary)">
              {formatDateTime(event.startsAt)}
              {event.location ? ` · ${event.location}` : ''}
            </Text>
          </div>
        ))}
      </Stack>
    </WidgetFrame>
  );
}
