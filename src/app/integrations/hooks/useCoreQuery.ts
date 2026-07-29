// useCoreQuery.ts
//
// Responsabilidade:
// Hook de leitura — busca dados de um módulo do Core através de
// `useCoreModule().query()`, expondo status/data/error normalizado
// (nunca um erro cru) e `refetch`. Executa automaticamente na
// montagem. Como nenhum Adapter desta Sprint implementa `query` de
// verdade, toda chamada resulta em `status: 'error'` com
// `ModuleUnavailableError` — comportamento esperado até a primeira
// integração real.

import { useCallback, useEffect, useState } from 'react';
import { useCoreModule } from './useCoreModule';
import { normalizeError } from '../errors/normalizeError';
import type { CoreIntegrationError } from '../errors/CoreIntegrationError';
import type { CoreRequest } from '../contracts/CoreRequest';
import type { CoreModuleId } from '../types/ModuleId';

export type CoreQueryStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseCoreQueryResult<Data> {
  status: CoreQueryStatus;
  data: Data | null;
  error: CoreIntegrationError | null;
  refetch: () => void;
}

export function useCoreQuery<Data>(moduleId: CoreModuleId, request: CoreRequest = {}): UseCoreQueryResult<Data> {
  const adapter = useCoreModule<Data>(moduleId);
  const [status, setStatus] = useState<CoreQueryStatus>('idle');
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<CoreIntegrationError | null>(null);

  const execute = useCallback(() => {
    setStatus('loading');
    setError(null);

    adapter
      .query(request)
      .then((response) => {
        setData(response.data);
        setStatus('success');
      })
      .catch((caught: unknown) => {
        setError(normalizeError(caught, moduleId));
        setStatus('error');
      });
    // `request` é comparado por referência — chamadores devem memoizar objetos de request não triviais.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter, moduleId]);

  useEffect(() => {
    execute();
  }, [execute]);

  return { status, data, error, refetch: execute };
}
