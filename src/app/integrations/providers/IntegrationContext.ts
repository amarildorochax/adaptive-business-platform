// IntegrationContext.ts
//
// Responsabilidade:
// Contexto React que carrega o `IntegrationRegistry` ativo, o
// `UserContext` atual (Sprint 30 — sempre `anonymousUserContext` até
// uma Sprint futura de Auth) e os `ObservabilityHooks` (sempre
// `noopObservabilityHooks` até um coletor real existir). Consumido
// exclusivamente via `hooks/useCoreModule` e afins — nunca diretamente
// por um componente de feature.

import { createContext } from 'react';
import type { IntegrationRegistry } from './IntegrationRegistry';
import type { UserContext } from '../types/UserContext';
import type { ObservabilityHooks } from '../types/Observability';

export interface IntegrationContextValue {
  registry: IntegrationRegistry;
  userContext: UserContext;
  observability: ObservabilityHooks;
}

export const IntegrationContext = createContext<IntegrationContextValue | undefined>(undefined);
