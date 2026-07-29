// useCoreHealth.ts
//
// Responsabilidade:
// Hook de saúde de um único módulo — chama `useCoreModule().health()`
// na montagem e expõe o `CoreHealthSnapshot` mais recente. Como nenhum
// Adapter desta Sprint faz uma checagem real, o status retornado é
// sempre `'unknown'`.

import { useCallback, useEffect, useState } from 'react';
import { useCoreModule } from './useCoreModule';
import type { CoreHealthSnapshot } from '../contracts/CoreStatus';
import type { CoreModuleId } from '../types/ModuleId';

export interface UseCoreHealthResult {
  snapshot: CoreHealthSnapshot | null;
  refresh: () => void;
}

export function useCoreHealth(moduleId: CoreModuleId): UseCoreHealthResult {
  const adapter = useCoreModule(moduleId);
  const [snapshot, setSnapshot] = useState<CoreHealthSnapshot | null>(null);

  const refresh = useCallback(() => {
    adapter.health().then(setSnapshot);
  }, [adapter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { snapshot, refresh };
}
