// useDashboardLayout.ts
//
// Responsabilidade:
// Guarda o `DashboardLayoutSnapshot` atual em estado React e expõe as
// transformações puras de `dashboardLayoutManager` como ações. Suporta
// reordenação real (moveUp/moveDown) — a estrutura de posição/tamanho
// (`updatePosition`) está pronta para uma futura interação de
// drag-and-drop/resize por ponteiro, que esta Sprint não implementa
// (apenas a "estrutura", conforme exigido pelo ESCOPO).

import { useCallback, useMemo, useState } from 'react';
import { dashboardLayoutManager } from '../services';
import { moveItem } from '../utils';
import type { DashboardLayoutSnapshot, WidgetDefinition, WidgetPosition } from '../types';

export interface UseDashboardLayoutResult {
  snapshot: DashboardLayoutSnapshot;
  updatePosition: (widgetId: string, position: WidgetPosition) => void;
  reorder: (orderedWidgetIds: string[]) => void;
  setVisibility: (widgetId: string, visible: boolean) => void;
  moveUp: (widgetId: string) => void;
  moveDown: (widgetId: string) => void;
}

export function useDashboardLayout(definitions: WidgetDefinition[]): UseDashboardLayoutResult {
  const defaultSnapshot = useMemo(() => dashboardLayoutManager.createDefaultSnapshot(definitions), [definitions]);
  const [snapshot, setSnapshot] = useState<DashboardLayoutSnapshot>(defaultSnapshot);

  const updatePosition = useCallback((widgetId: string, position: WidgetPosition) => {
    setSnapshot((prev) => dashboardLayoutManager.updatePosition(prev, widgetId, position));
  }, []);

  const reorder = useCallback((orderedWidgetIds: string[]) => {
    setSnapshot((prev) => dashboardLayoutManager.reorder(prev, orderedWidgetIds));
  }, []);

  const setVisibility = useCallback((widgetId: string, visible: boolean) => {
    setSnapshot((prev) => dashboardLayoutManager.setVisibility(prev, widgetId, visible));
  }, []);

  const moveUp = useCallback((widgetId: string) => {
    setSnapshot((prev) => {
      const index = prev.entries.findIndex((entry) => entry.widgetId === widgetId);
      if (index <= 0) return prev;
      return { ...prev, entries: moveItem(prev.entries, index, index - 1) };
    });
  }, []);

  const moveDown = useCallback((widgetId: string) => {
    setSnapshot((prev) => {
      const index = prev.entries.findIndex((entry) => entry.widgetId === widgetId);
      if (index === -1 || index >= prev.entries.length - 1) return prev;
      return { ...prev, entries: moveItem(prev.entries, index, index + 1) };
    });
  }, []);

  return { snapshot, updatePosition, reorder, setVisibility, moveUp, moveDown };
}
