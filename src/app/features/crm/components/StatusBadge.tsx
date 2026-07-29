// StatusBadge.tsx
//
// Responsabilidade:
// Traduz um status de entidade do CRM (`ClientStatus`/`CrmRecordStatus`/
// `ActivityStatus`) em um `Badge` do Design System, com rótulo em
// Português e variante semântica consistente. Um único componente cobre
// os três vocabulários de status do CRM para evitar três badges quase
// idênticos.

import { Badge } from '@/design-system/components';
import type { ComponentVariant } from '@/design-system/types';
import type { ClientStatus } from '../types/Client';
import type { CrmRecordStatus } from '../types/common';
import type { ActivityStatus } from '../types/Activity';

export type CrmStatus = ClientStatus | CrmRecordStatus | ActivityStatus;

const LABEL: Record<CrmStatus, string> = {
  lead: 'Lead',
  prospect: 'Prospect',
  customer: 'Cliente',
  inactive: 'Inativo',
  active: 'Ativo',
  archived: 'Arquivado',
  pending: 'Pendente',
  completed: 'Concluído',
  canceled: 'Cancelado',
};

const VARIANT: Record<CrmStatus, ComponentVariant> = {
  lead: 'info',
  prospect: 'warning',
  customer: 'success',
  inactive: 'neutral',
  active: 'success',
  archived: 'neutral',
  pending: 'warning',
  completed: 'success',
  canceled: 'danger',
};

export interface StatusBadgeProps {
  status: CrmStatus;
}

export function StatusBadge(props: StatusBadgeProps) {
  const { status } = props;
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
