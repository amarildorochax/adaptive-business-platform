// useLocalCollection.ts
//
// Responsabilidade:
// Camada de CRUD local (Sprint 33) — mescla uma coleção somente-leitura
// vinda de um hook de entidade já existente (`useClients`, `useDeals`
// etc., protegidos, não alterados por esta Sprint) com mutações em
// memória (criação/edição/remoção). "Sem persistência externa": nada
// aqui grava em disco/rede — o estado vive apenas na sessão do
// navegador, exatamente como o restante do CRM (100% mock).
//
// Deliberadamente fora de `hooks/` (que permanece intocado nesta
// Sprint) — vive em `workspace/`, a camada de suporte exclusiva às
// telas operacionais introduzidas agora.

import { useCallback, useMemo, useState } from 'react';

export interface UseLocalCollectionResult<T> {
  items: T[];
  add: (item: T) => void;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
}

export function useLocalCollection<T extends { id: string }>(source: T[]): UseLocalCollectionResult<T> {
  const [added, setAdded] = useState<T[]>([]);
  const [overrides, setOverrides] = useState<Record<string, Partial<T>>>({});
  const [removedIds, setRemovedIds] = useState<Record<string, true>>({});

  const items = useMemo(() => {
    return [...added, ...source]
      .filter((item) => !removedIds[item.id])
      .map((item) => (overrides[item.id] ? { ...item, ...overrides[item.id] } : item));
  }, [source, added, overrides, removedIds]);

  const add = useCallback((item: T) => {
    setAdded((prev) => [item, ...prev]);
  }, []);

  const update = useCallback((id: string, patch: Partial<T>) => {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  const remove = useCallback((id: string) => {
    setRemovedIds((prev) => ({ ...prev, [id]: true }));
  }, []);

  return { items, add, update, remove };
}
