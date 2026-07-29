// useDashboard.ts
//
// Responsabilidade:
// Hook de topo do Dashboard — compõe `useWidgetRegistry`, `useWidgets`
// e `useDashboardLayout` em uma única API, consumida por `DashboardHome`
// e pelos painéis (`DashboardToolbar`, `DashboardGrid`).

import { useWidgetRegistry } from './useWidgetRegistry';
import { useWidgets, type UseWidgetsResult } from './useWidgets';
import { useDashboardLayout, type UseDashboardLayoutResult } from './useDashboardLayout';
import type { WidgetDefinition } from '../types';

export interface UseDashboardResult extends UseWidgetsResult {
  definitions: WidgetDefinition[];
  layout: UseDashboardLayoutResult;
}

export function useDashboard(): UseDashboardResult {
  const definitions = useWidgetRegistry();
  const widgets = useWidgets(definitions);
  const layout = useDashboardLayout(definitions);

  return { definitions, layout, ...widgets };
}
