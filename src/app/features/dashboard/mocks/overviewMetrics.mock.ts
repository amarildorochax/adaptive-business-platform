// overviewMetrics.mock.ts
//
// Responsabilidade:
// Dado simulado do widget "Visão Geral". Quando este widget for
// conectado a um módulo real do Core (Sprint futura), o shape de
// `OverviewMetric` é o contrato que a integração deverá respeitar.
//
// Sprint 31: adicionados `icon`, `period` e `variant` (cor temática) —
// evolução puramente visual dos "Cards Superiores", sem mudar o
// significado dos campos já existentes.

import type { IconName } from '@/design-system/foundations';
import type { ComponentVariant } from '@/design-system/types';

export interface OverviewMetric {
  id: string;
  label: string;
  value: string;
  changePercent: number;
  period: string;
  icon: IconName;
  variant: ComponentVariant;
}

export function generateOverviewMetrics(): OverviewMetric[] {
  return [
    {
      id: 'revenue',
      label: 'Receita',
      value: 'R$ 128.400',
      changePercent: 8.2,
      period: 'em relação ao mês anterior',
      icon: 'module-finance',
      variant: 'success',
    },
    {
      id: 'active-deals',
      label: 'Negócios ativos',
      value: '47',
      changePercent: 3.1,
      period: 'em relação ao mês anterior',
      icon: 'module-crm',
      variant: 'primary',
    },
    {
      id: 'new-leads',
      label: 'Novos leads',
      value: '132',
      changePercent: -2.4,
      period: 'em relação ao mês anterior',
      icon: 'module-marketing',
      variant: 'info',
    },
    {
      id: 'churn',
      label: 'Cancelamentos',
      value: '1.8%',
      changePercent: -0.5,
      period: 'em relação ao mês anterior',
      icon: 'module-analytics',
      variant: 'warning',
    },
  ];
}
