// useCoreStatus.ts
//
// Responsabilidade:
// Hook de saúde agregada — chama `health()` de todos os Adapters
// registrados em `IntegrationRegistry` e expõe um snapshot por módulo.
// Base para um futuro painel de status da plataforma.

import { useCallback, useEffect, useState } from 'react';
import { useIntegrationContext } from './useIntegrationContext';
import type { CoreHealthSnapshot } from '../contracts/CoreStatus';

export interface UseCoreStatusResult {
  snapshots: CoreHealthSnapshot[];
  refresh: () => void;
}

export function useCoreStatus(): UseCoreStatusResult {
  const { registry } = useIntegrationContext();
  const [snapshots, setSnapshots] = useState<CoreHealthSnapshot[]>([]);

  const refresh = useCallback(() => {
    Promise.all(registry.getAll().map((adapter) => adapter.health())).then(setSnapshots);
  }, [registry]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { snapshots, refresh };
}
