import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { EmptyState } from "./EmptyState";

export interface TableColumn<T> {
  readonly key: string;
  readonly header: string;
  readonly render: (row: T) => ReactNode;
  /** Presente apenas em colunas ordenáveis — nunca todas as colunas precisam ser. */
  readonly sortValue?: (row: T) => string | number;
}

export interface TableProps<T> {
  readonly columns: readonly TableColumn<T>[];
  readonly rows: readonly T[];
  readonly getRowId: (row: T) => string;
  readonly searchPlaceholder?: string;
  readonly searchText?: (row: T) => string;
  readonly pageSize?: number;
  readonly emptyTitle?: string;
  readonly emptyDescription?: string;
  readonly rowActions?: (row: T) => ReactNode;
}

/**
 * Tabela padrão do Design System (UX-001) — busca (client-side, sobre o dado já carregado — nenhuma
 * chamada de rede nova, nenhum Manager ainda expõe busca server-side), ordenação, paginação e estado
 * vazio, tudo em um único componente reutilizável. Nenhuma página desta Sprint monta sua própria
 * tabela HTML crua.
 */
export function Table<T>({ columns, rows, getRowId, searchPlaceholder, searchText, pageSize = 10, emptyTitle = "Nenhum registro encontrado", emptyDescription, rowActions }: TableProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | undefined>(undefined);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!searchText || query.trim() === "") {
      return rows;
    }
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => searchText(row).toLowerCase().includes(needle));
  }, [rows, query, searchText]);

  const sorted = useMemo(() => {
    if (!sort) {
      return filtered;
    }
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) {
      return filtered;
    }
    const direction = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      return av < bv ? -1 * direction : av > bv ? 1 * direction : 0;
    });
  }, [filtered, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRows = sorted.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  function toggleSort(column: TableColumn<T>) {
    if (!column.sortValue) {
      return;
    }
    setSort((current) => {
      if (current?.key !== column.key) {
        return { key: column.key, direction: "asc" };
      }
      return { key: column.key, direction: current.direction === "asc" ? "desc" : "asc" };
    });
  }

  return (
    <div className="table-wrapper">
      {searchText && (
        <div className="table-toolbar">
          <div className="topbar__search" style={{ maxWidth: 280 }}>
            <Search size={16} className="topbar__search-icon" aria-hidden="true" />
            <input
              type="search"
              className="topbar__search-input"
              placeholder={searchPlaceholder ?? "Buscar…"}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              aria-label={searchPlaceholder ?? "Buscar"}
            />
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} onClick={() => toggleSort(column)} aria-sort={sort?.key === column.key ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {column.header}
                      {column.sortValue && (sort?.key === column.key ? sort.direction === "asc" ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" /> : <ArrowUpDown size={12} aria-hidden="true" />)}
                    </span>
                  </th>
                ))}
                {rowActions && <th aria-hidden="true" />}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={getRowId(row)}>
                  {columns.map((column) => (
                    <td key={column.key}>{column.render(row)}</td>
                  ))}
                  {rowActions && <td>{rowActions(row)}</td>}
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="table-pagination">
              <span>
                Página {currentPage + 1} de {totalPages} — {sorted.length} registro(s)
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="btn btn--sm btn--secondary" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
                  Anterior
                </button>
                <button type="button" className="btn btn--sm btn--secondary" disabled={currentPage >= totalPages - 1} onClick={() => setPage(currentPage + 1)}>
                  Próxima
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
