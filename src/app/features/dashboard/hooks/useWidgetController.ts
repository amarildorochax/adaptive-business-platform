// useWidgetController.ts
//
// Responsabilidade:
// Hook por widget que orquestra o `WidgetController` — recebe o
// `WidgetState`/`refresh` já providos por `useWidgets` (Sprint 28, via
// `useDashboard`) e adiciona, sobre eles: derivação do
// `WidgetControllerStatus` (7 estados), contagem de retry, checagem de
// permissão e registro de telemetria (ambos com política/coletor nulos
// por padrão — nenhuma regra de negócio, nenhuma integração real).
//
// Nota de design (Sprint 29A): o fetch em si (`dashboardMockService`)
// permanece dentro de `useWidgets`, não duplicado aqui — mover o fetch
// para este hook exigiria também mover a agregação usada por
// `DashboardToolbar`/`DashboardFooter`/`DashboardSidebar`
// (`refreshAll`, contagem de última atualização), o que arriscaria
// regressão sem necessidade. O ponto de integração futura com o Core
// continua sendo único e bem definido: `refresh` é apenas um callback
// injetado — substituir sua origem (de `useWidgets` para uma fachada do
// Core) não exige alterar este hook, `WidgetController` nem nenhum
// Widget.

import { useCallback, useEffect, useRef, useState } from 'react';
import { allowAllPermissionPolicy, type PermissionContext, type PermissionPolicy } from '../controllers/permissions';
import { noopWidgetTelemetry, type WidgetTelemetry } from '../controllers/telemetry';
import { defaultWidgetFeatureFlags, type WidgetFeatureFlags } from '../controllers/featureFlags';
import { deriveControllerStatus, type WidgetControllerStatus } from '../controllers/WidgetControllerStatus';
import type { WidgetDefinition, WidgetState } from '../types';

export interface UseWidgetControllerOptions {
  definition: WidgetDefinition;
  state: WidgetState;
  onRefresh: () => void;
  permissionPolicy?: PermissionPolicy;
  permissionContext?: PermissionContext;
  telemetry?: WidgetTelemetry;
  featureFlags?: WidgetFeatureFlags;
}

export interface UseWidgetControllerResult {
  status: WidgetControllerStatus;
  state: WidgetState;
  canView: boolean;
  refresh: () => void;
  retry: () => void;
  retryCount: number;
}

export function useWidgetController(options: UseWidgetControllerOptions): UseWidgetControllerResult {
  const {
    definition,
    state,
    onRefresh,
    permissionPolicy = allowAllPermissionPolicy,
    permissionContext = {},
    telemetry = noopWidgetTelemetry,
    featureFlags = defaultWidgetFeatureFlags,
  } = options;

  const [retryCount, setRetryCount] = useState(0);
  const previousStatusRef = useRef(state.status);

  useEffect(() => {
    telemetry.record({ widgetId: definition.id, type: 'view', timestamp: new Date().toISOString() });
    // Registrado apenas uma vez, na montagem do controller deste widget.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (previousStatusRef.current !== 'error' && state.status === 'error') {
      telemetry.record({ widgetId: definition.id, type: 'error', timestamp: new Date().toISOString() });
    }
    previousStatusRef.current = state.status;
  }, [state.status, definition.id, telemetry]);

  const refresh = useCallback(() => {
    telemetry.record({ widgetId: definition.id, type: 'refresh', timestamp: new Date().toISOString() });
    onRefresh();
  }, [onRefresh, telemetry, definition.id]);

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1);
    telemetry.record({ widgetId: definition.id, type: 'retry', timestamp: new Date().toISOString() });
    onRefresh();
  }, [onRefresh, telemetry, definition.id]);

  return {
    status: deriveControllerStatus(state, featureFlags),
    state,
    canView: permissionPolicy.canView(permissionContext, definition.permissions),
    refresh,
    retry,
    retryCount,
  };
}
