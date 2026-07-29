// Widget.ts
//
// Responsabilidade:
// Contrato canônico de um Widget do Dashboard — todo widget (existente
// ou futuro) é descrito por um `WidgetDefinition` e renderiza a partir
// de um `WidgetState<Data>`. Nenhum campo aqui pressupõe nenhuma
// integração real com o Core.

import type { IconName } from '@/design-system/foundations';

export type WidgetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/** Posição/dimensão no grid, em unidades de coluna/linha — não pixels. */
export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Estrutura preparada para controle de acesso por widget. Nada aqui é
 * avaliado/imposto nesta Sprint — é apenas o contrato que uma Sprint
 * futura de Auth/Permissions poderá consumir.
 */
export interface WidgetPermissions {
  requiresAuth?: boolean;
  roles?: string[];
}

export type WidgetRefreshPolicy = { mode: 'manual' } | { mode: 'interval'; intervalMs: number };

export interface WidgetDefinition {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  size: WidgetSize;
  position: WidgetPosition;
  permissions: WidgetPermissions;
  refreshPolicy: WidgetRefreshPolicy;
}

export type WidgetStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface WidgetState<Data = unknown> {
  status: WidgetStatus;
  data: Data | null;
  error: string | null;
  lastUpdatedAt: string | null;
}
