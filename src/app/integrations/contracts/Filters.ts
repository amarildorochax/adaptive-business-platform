// Filters.ts
//
// Responsabilidade:
// Contrato de filtros da camada de integração — genérico o suficiente
// para qualquer módulo futuro do Core, sem assumir nenhum campo real.

export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export type FilterParams = FilterCondition[];
