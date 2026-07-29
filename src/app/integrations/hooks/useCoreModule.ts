// useCoreModule.ts
//
// Responsabilidade:
// Resolve o `CoreModuleAdapter` registrado para `moduleId`. É o único
// ponto onde um componente/hook "escolhe" qual módulo do Core quer
// falar com — nunca conhece a implementação interna do Adapter.

import { useMemo } from 'react';
import { useIntegrationContext } from './useIntegrationContext';
import { ModuleUnavailableError } from '../errors/ModuleUnavailableError';
import type { CoreModuleAdapter } from '../core/adapters';
import type { CoreModuleId } from '../types/ModuleId';

export function useCoreModule<Dto = unknown, Command = unknown>(
  moduleId: CoreModuleId,
): CoreModuleAdapter<Dto, Command> {
  const { registry } = useIntegrationContext();

  return useMemo(() => {
    const adapter = registry.get(moduleId);
    if (!adapter) {
      throw new ModuleUnavailableError(`Nenhum Adapter registrado para o módulo "${moduleId}".`, moduleId);
    }
    return adapter as CoreModuleAdapter<Dto, Command>;
  }, [registry, moduleId]);
}
