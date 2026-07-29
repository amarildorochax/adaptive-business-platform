// DataTable.tsx
//
// Responsabilidade:
// Experiência de tabela padronizada do CRM (Sprint 33) — pesquisa,
// ordenação (clique no cabeçalho), paginação, contador, estado vazio e
// de carregamento, todos sobre o `Table` genérico do Adaptive Design
// System (Sprint 26). Toda página de listagem do CRM deve usar este
// componente em vez de montar sua própria tabela.

import type { ReactNode } from 'react';
import { Stack, Flex, Icon } from '@/app/primitives';
import { Table, Loading, EmptyState } from '@/design-system/components';
import type { TableColumn } from '@/design-system/components';
import { useTableState } from '../../workspace';
import { SearchInput } from './SearchInput';
import { Pagination } from './Pagination';

export interface DataTableColumn<Row> {
  key: string;
  header: string;
  sortKey?: keyof Row;
  render: (row: Row) => ReactNode;
}

export interface DataTableProps<Row> {
  data: Row[];
  columns: DataTableColumn<Row>[];
  searchableFields: (keyof Row)[];
  getRowKey: (row: Row) => string;
  searchPlaceholder?: string;
  pageSize?: number;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbar?: ReactNode;
}

export function DataTable<Row>(props: DataTableProps<Row>) {
  const {
    data,
    columns,
    searchableFields,
    getRowKey,
    searchPlaceholder,
    pageSize = 8,
    loading,
    emptyTitle = 'Nenhum registro encontrado',
    emptyDescription = 'Ajuste a pesquisa ou os filtros para ver outros resultados.',
    toolbar,
  } = props;

  const table = useTableState(data, { searchableFields, pageSize });

  const tableColumns: TableColumn<Row>[] = columns.map((column) => ({
    key: column.key,
    header: column.sortKey ? (
      <button
        type="button"
        onClick={() => table.setSort(column.sortKey as keyof Row)}
        className="ads-focusable"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', font: 'inherit' }}
      >
        <Flex align="center" gap={4}>
          {column.header}
          {table.sortKey === column.sortKey && (
            <Icon name={table.sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'} size={12} />
          )}
        </Flex>
      </button>
    ) : (
      column.header
    ),
    render: column.render,
  }));

  return (
    <Stack gap={12}>
      <Flex justify="space-between" align="center" gap={12} wrap>
        <div style={{ maxWidth: 320, flex: 1 }}>
          <SearchInput value={table.search} onChange={table.setSearch} placeholder={searchPlaceholder} />
        </div>
        {toolbar}
      </Flex>

      {loading ? (
        <Loading label="Carregando…" />
      ) : table.totalCount === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <Table columns={tableColumns} rows={table.pageItems} getRowKey={getRowKey} />
          </div>
          <Pagination page={table.page} pageCount={table.pageCount} totalCount={table.totalCount} onPageChange={table.setPage} />
        </>
      )}
    </Stack>
  );
}
