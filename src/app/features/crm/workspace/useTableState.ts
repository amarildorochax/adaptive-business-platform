// useTableState.ts
//
// Responsabilidade:
// Pesquisa instantânea + ordenação + paginação genéricas, 100%
// client-side (sem backend — filtra diretamente sobre o array recebido,
// que já vem dos mocks via `useLocalCollection`). Filtros por
// campo (status/empresa/responsável/etiqueta) são aplicados pela página
// chamadora *antes* de repassar `data` a este hook — este hook cuida
// apenas de busca textual + ordenação + página.

import { useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface UseTableStateOptions<T> {
  searchableFields: (keyof T)[];
  pageSize?: number;
}

export interface UseTableStateResult<T> {
  search: string;
  setSearch: (value: string) => void;
  sortKey: keyof T | null;
  sortDirection: SortDirection;
  setSort: (key: keyof T) => void;
  page: number;
  setPage: (page: number) => void;
  pageCount: number;
  pageItems: T[];
  totalCount: number;
}

export function useTableState<T>(data: T[], options: UseTableStateOptions<T>): UseTableStateResult<T> {
  const { searchableFields, pageSize = 9 } = options;

  const [search, setSearchValue] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);

  const setSearch = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  const setSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;

    return data.filter((item) =>
      searchableFields.some((field) => String(item[field] ?? '').toLowerCase().includes(term)),
    );
  }, [data, search, searchableFields]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;

    const copy = [...filtered];
    copy.sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }

      const textA = String(valueA ?? '');
      const textB = String(valueB ?? '');
      return sortDirection === 'asc' ? textA.localeCompare(textB) : textB.localeCompare(textA);
    });
    return copy;
  }, [filtered, sortKey, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount);

  const pageItems = useMemo(
    () => sorted.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sorted, safePage, pageSize],
  );

  return {
    search,
    setSearch,
    sortKey,
    sortDirection,
    setSort,
    page: safePage,
    setPage,
    pageCount,
    pageItems,
    totalCount: sorted.length,
  };
}
