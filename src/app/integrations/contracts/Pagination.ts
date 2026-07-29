// Pagination.ts
//
// Responsabilidade:
// Contrato de paginação da camada de integração — usado em
// `CoreRequest`/`CoreResponse`. Independente de qualquer DTO real do
// Core (nenhum módulo foi conectado ainda).

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
