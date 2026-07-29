// useCoreMutation.ts
//
// Responsabilidade:
// Hook de escrita — dispara `useCoreModule().mutate()` imperativamente
// (nunca automático na montagem, diferente de `useCoreQuery`), expondo
// status/data/error normalizado. Mesma ressalva: nenhum Adapter
// implementa `mutate` de verdade nesta Sprint.

import { useCallback, useState } from 'react';
import { useCoreModule } from './useCoreModule';
import { normalizeError } from '../errors/normalizeError';
import type { CoreIntegrationError } from '../errors/CoreIntegrationError';
import type { CoreModuleId } from '../types/ModuleId';

export type CoreMutationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseCoreMutationResult<Data, Command> {
  status: CoreMutationStatus;
  data: Data | null;
  error: CoreIntegrationError | null;
  mutate: (command: Command) => Promise<Data | null>;
}

export function useCoreMutation<Data, Command>(moduleId: CoreModuleId): UseCoreMutationResult<Data, Command> {
  const adapter = useCoreModule<Data, Command>(moduleId);
  const [status, setStatus] = useState<CoreMutationStatus>('idle');
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<CoreIntegrationError | null>(null);

  const mutate = useCallback(
    async (command: Command) => {
      setStatus('loading');
      setError(null);

      try {
        const response = await adapter.mutate(command);
        setData(response.data);
        setStatus('success');
        return response.data;
      } catch (caught) {
        const normalized = normalizeError(caught, moduleId);
        setError(normalized);
        setStatus('error');
        return null;
      }
    },
    [adapter, moduleId],
  );

  return { status, data, error, mutate };
}
