// Table.tsx
//
// Responsabilidade:
// Componente Table — estrutura genérica da Sprint 26, identidade
// visual real aplicada na Sprint 29 e refinada na Sprint 31B (Premium
// Dark Theme): cabeçalho em caixa alta com espaçamento entre letras
// (`.ads-table-header`), linhas com hover/separador dedicados
// (`.ads-table-row`, usa `--ads-color-hover`) e padding mais generoso.

import type { ReactNode } from 'react';
import { spacing } from '../../tokens/spacing';

export interface TableColumn<Row> {
  key: string;
  header: ReactNode;
  render: (row: Row) => ReactNode;
}

export interface TableProps<Row> {
  columns: Array<TableColumn<Row>>;
  rows: Row[];
  getRowKey: (row: Row) => string;
}

const cellPadding = { padding: `${spacing[12]} ${spacing[16]}` };

export function Table<Row>(props: TableProps<Row>) {
  const { columns, rows, getRowKey } = props;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} className="ads-table-header" style={{ ...cellPadding, textAlign: 'left' }}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getRowKey(row)} className="ads-table-row ads-transition">
            {columns.map((column) => (
              <td key={column.key} style={cellPadding}>
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
