// CoreIntegrationProvider.tsx
//
// Responsabilidade:
// Provider de topo da camada de integração — monta o
// `IntegrationContext` com o `integrationRegistry` (já populado com os
// 13 Adapters), o `UserContext` (padrão: anônimo) e os
// `ObservabilityHooks` (padrão: noop). Não é montado em `main.tsx`
// nesta Sprint — permanece inerte, mesma decisão não-invasiva de todas
// as Sprints anteriores do Frontend.

import { useMemo, type ReactNode } from 'react';
import { IntegrationContext, type IntegrationContextValue } from './IntegrationContext';
import { integrationRegistry } from './IntegrationRegistry';
import { anonymousUserContext, type UserContext } from '../types/UserContext';
import { noopObservabilityHooks, type ObservabilityHooks } from '../types/Observability';

export interface CoreIntegrationProviderProps {
  children?: ReactNode;
  userContext?: UserContext;
  observability?: ObservabilityHooks;
}

export function CoreIntegrationProvider(props: CoreIntegrationProviderProps) {
  const { children, userContext = anonymousUserContext, observability = noopObservabilityHooks } = props;

  const value = useMemo<IntegrationContextValue>(
    () => ({ registry: integrationRegistry, userContext, observability }),
    [userContext, observability],
  );

  return <IntegrationContext.Provider value={value}>{children}</IntegrationContext.Provider>;
}
