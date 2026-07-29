// ActivityItem.tsx
//
// Responsabilidade:
// Renderiza uma `Activity` — usado pela página "Atividades" e pela
// Agenda. Ícone por `ActivityType` limitado ao conjunto de ícones já
// reservado pelo Design System (Sprint 26/29) — nenhum ícone novo foi
// adicionado por esta Sprint.
//
// Sprint 33 (Adaptive CRM Workspace): ganhou dois callbacks opcionais —
// `onClick` (abre edição) e `onComplete` (exibe um botão "Concluir",
// somente quando a atividade está pendente). Sem essas props, o
// comportamento é idêntico ao da Sprint 32.

import type { IconName } from '@/design-system/foundations';
import { Flex, Stack, Text, Icon } from '@/app/primitives';
import { Button } from '@/design-system/components';
import { StatusBadge } from './StatusBadge';
import type { Activity, ActivityType } from '../types/Activity';

const TYPE_LABEL: Record<ActivityType, string> = {
  call: 'Ligação',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  meeting: 'Reunião',
  task: 'Tarefa',
  visit: 'Visita',
  note: 'Observação',
};

const TYPE_ICON: Record<ActivityType, IconName> = {
  call: 'user',
  whatsapp: 'module-marketing',
  email: 'info',
  meeting: 'user',
  task: 'check',
  visit: 'home',
  note: 'edit',
};

export interface ActivityItemProps {
  activity: Activity;
  onClick?: () => void;
  onComplete?: () => void;
}

export function ActivityItem(props: ActivityItemProps) {
  const { activity, onClick, onComplete } = props;

  return (
    <Flex justify="space-between" align="center" style={{ padding: '8px 0' }}>
      <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined, flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icon name={TYPE_ICON[activity.type]} size={16} />
        <Stack gap={2}>
          <Text variant="body">{activity.description}</Text>
          <Text variant="caption" color="var(--ads-color-text-auxiliary)">
            {TYPE_LABEL[activity.type]} · {activity.ownerName} · {new Date(activity.date).toLocaleDateString('pt-BR')} {activity.time}
          </Text>
        </Stack>
      </div>
      <Flex align="center" gap={8}>
        <StatusBadge status={activity.status} />
        {onComplete && activity.status === 'pending' && (
          <Button variant="success" size="sm" onClick={onComplete}>
            Concluir
          </Button>
        )}
      </Flex>
    </Flex>
  );
}
