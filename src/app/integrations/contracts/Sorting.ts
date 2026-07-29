// Sorting.ts
//
// Responsabilidade:
// Contrato de ordenação da camada de integração.

export type SortDirection = 'asc' | 'desc';

export interface SortCondition {
  field: string;
  direction: SortDirection;
}

export type SortingParams = SortCondition[];
