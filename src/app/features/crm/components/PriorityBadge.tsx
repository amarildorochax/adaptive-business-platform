// PriorityBadge.tsx
//
// Responsabilidade:
// Badge de prioridade padronizado (Sprint 33). Nenhuma entidade do CRM
// tem um campo `priority` (types/ é protegido nesta Sprint) — este
// componente aceita a prioridade computada pela página chamadora (ex.:
// `DealsWorkspacePage` deriva prioridade de `probability`/`value`).

import { Badge } from '@/design-system/components';
import type { ComponentVariant } from '@/design-system/types';

export type Priority = 'low' | 'medium' | 'high';

const LABEL: Record<Priority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const VARIANT: Record<Priority, ComponentVariant> = {
  low: 'neutral',
  medium: 'warning',
  high: 'danger',
};

export interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge(props: PriorityBadgeProps) {
  const { priority } = props;
  return <Badge variant={VARIANT[priority]}>{LABEL[priority]}</Badge>;
}
