// useCrmResource.ts
//
// Responsabilidade:
// Hook interno compartilhado por todos os hooks de entidade do CRM
// (`useCompanies`/`useClients`/...) — evita repetir o mesmo boilerplate
// de loading/error/refetch em cada um. Não exportado no barrel público
// de `hooks/` (uso interno deste diretório apenas).

import { useCallback, useEffect, useState } from 'react';

export interface UseCrmResourceResult<Data> {
  data: Data[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCrmResource<Data>(fetcher: () => Promise<Data[]>): UseCrmResourceResult<Data> {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => setData(result))
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Erro desconhecido ao carregar dados do CRM.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
