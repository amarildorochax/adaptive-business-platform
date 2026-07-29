// TopDealsTableWidget.tsx
//
// Responsabilidade:
// Widget mock "Tabela" — principais negócios em aberto, usando o
// componente `Table` do Adaptive Design System (Sprint 26/29). Dado
// 100% simulado; nenhum acesso ao Core.

import { WidgetFrame } from '../../components';
import { Table, type TableColumn } from '@/design-system/components';
import type { WidgetDefinition, WidgetState } from '../../types';
import type { DealRow } from '../../mocks';

export const topDealsDefinition: WidgetDefinition = {
  id: 'top-deals',
  title: 'Principais Negócios',
  description: 'Negócios em aberto com maior valor (simulado).',
  icon: 'chevron-up',
  size: 'xl',
  position: { x: 0, y: 4, w: 8, h: 2 },
  permissions: {},
  refreshPolicy: { mode: 'manual' },
};

export interface TopDealsTableWidgetProps {
  state: WidgetState<DealRow[]>;
  onRefresh: () => void;
}

const columns: Array<TableColumn<DealRow>> = [
  { key: 'name', header: 'Negócio', render: (row) => row.name },
  { key: 'owner', header: 'Responsável', render: (row) => row.owner },
  { key: 'value', header: 'Valor', render: (row) => row.value },
  { key: 'stage', header: 'Estágio', render: (row) => row.stage },
];

export function TopDealsTableWidget(props: TopDealsTableWidgetProps) {
  const { state, onRefresh } = props;

  return (
    <WidgetFrame definition={topDealsDefinition} state={state} onRefresh={onRefresh}>
      <Table columns={columns} rows={state.data ?? []} getRowKey={(row) => row.id} />
    </WidgetFrame>
  );
}
