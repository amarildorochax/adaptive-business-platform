// WidgetControllerStatus.ts
//
// Responsabilidade:
// Modelo de estado padronizado do WidgetController (Sprint 29A) — mais
// rico que o `WidgetStatus` de 4 valores da Sprint 28
// (`idle|loading|ready|error`), acrescentando `refreshing` (já havia
// dado e uma nova busca está em andamento), `empty` (sucesso, mas sem
// dado a exibir) e `disabled` (feature flag desativa o widget).
// Derivado a partir de `WidgetState` + `WidgetFeatureFlags` — nunca
// armazenado de forma independente, para não haver duas fontes de
// verdade sobre o estado de um widget.

import type { WidgetState } from '../types';
import type { WidgetFeatureFlags } from './featureFlags';

export type WidgetControllerStatus = 'idle' | 'loading' | 'refreshing' | 'success' | 'error' | 'disabled' | 'empty';

function isEmptyData(data: unknown): boolean {
  if (data === null || data === undefined) return true;
  if (Array.isArray(data)) return data.length === 0;
  return false;
}

/** Deriva o `WidgetControllerStatus` a partir do `WidgetState` (Sprint 28) e das feature flags do widget. */
export function deriveControllerStatus(state: WidgetState, featureFlags: WidgetFeatureFlags): WidgetControllerStatus {
  if (!featureFlags.enabled || featureFlags.hidden) return 'disabled';

  switch (state.status) {
    case 'idle':
      return 'idle';
    case 'loading':
      return state.data !== null ? 'refreshing' : 'loading';
    case 'error':
      return 'error';
    case 'ready':
      return isEmptyData(state.data) ? 'empty' : 'success';
    default:
      return 'idle';
  }
}
