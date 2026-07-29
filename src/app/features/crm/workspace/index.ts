// index.ts
//
// Responsabilidade:
// Ponto único de exportação da camada de suporte operacional do CRM
// (Sprint 33) — CRUD local em memória e utilitários de tabela
// (busca/ordenação/paginação). Não confundir com `hooks/` (Sprint 32,
// leitura via `CrmMockService`, intocado nesta Sprint).

export * from './useLocalCollection';
export * from './useTableState';
export * from './generateId';
