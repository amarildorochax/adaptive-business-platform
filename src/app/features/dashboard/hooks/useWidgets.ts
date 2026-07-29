// useWidgets.ts
//
// Responsabilidade:
// Gerencia o `WidgetState` (status/data/error) de cada widget, buscando
// dados via `dashboardMockService` — nenhuma chamada ao Core. Widgets
// com `refreshPolicy.mode === 'interval'` são atualizados
// automaticamente nesse intervalo; os demais só são atualizados por
// `refresh()`/`refreshAll()` explícito.

import { useCallback, useEffect, useState } from 'react';
import { dashboardMockService } from '../services';
import type { WidgetDefinition, WidgetState } from '../types';

export interface UseWidgetsResult {
  states: Record<string, WidgetState>;
  refresh: (widgetId: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}

function initialStateFor(): WidgetState {
  return { status: 'idle', data: null, error: null, lastUpdatedAt: null };
}

export function useWidgets(definitions: WidgetDefinition[]): UseWidgetsResult {
  const [states, setStates] = useState<Record<string, WidgetState>>(() =>
    Object.fromEntries(definitions.map((definition) => [definition.id, initialStateFor()])),
  );

  const refresh = useCallback(async (widgetId: string) => {
    setStates((prev) => ({ ...prev, [widgetId]: { ...(prev[widgetId] ?? initialStateFor()), status: 'loading' } }));

    try {
      const data = await dashboardMockService.fetchWidgetData(widgetId);
      setStates((prev) => ({
        ...prev,
        [widgetId]: { status: 'ready', data, error: null, lastUpdatedAt: new Date().toISOString() },
      }));
    } catch (error) {
      setStates((prev) => ({
        ...prev,
        [widgetId]: {
          ...(prev[widgetId] ?? initialStateFor()),
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido ao carregar o widget.',
        },
      }));
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all(definitions.map((definition) => refresh(definition.id)));
  }, [definitions, refresh]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    const timers = definitions
      .filter((definition) => definition.refreshPolicy.mode === 'interval')
      .map((definition) => {
        const { intervalMs } = definition.refreshPolicy as { mode: 'interval'; intervalMs: number };
        return window.setInterval(() => refresh(definition.id), intervalMs);
      });

    return () => timers.forEach((timer) => window.clearInterval(timer));
  }, [definitions, refresh]);

  return { states, refresh, refreshAll };
}
