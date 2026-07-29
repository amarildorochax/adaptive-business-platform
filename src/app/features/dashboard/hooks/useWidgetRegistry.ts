// useWidgetRegistry.ts
//
// Responsabilidade:
// Expõe o catálogo estático de `WidgetDefinition` já registrado (ver
// `widgets/index.ts`, que popula `dashboardWidgetRegistry` no import).

import { useMemo } from 'react';
import { dashboardWidgetRegistry } from '../services';
import type { WidgetDefinition } from '../types';

export function useWidgetRegistry(): WidgetDefinition[] {
  return useMemo(() => dashboardWidgetRegistry.getAll(), []);
}
