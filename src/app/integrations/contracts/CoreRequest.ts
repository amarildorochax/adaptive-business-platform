// CoreRequest.ts
//
// Responsabilidade:
// Envelope genérico de requisição da camada de integração — o único
// formato que um Adapter aceita, independente de qual módulo do Core
// ele eventualmente representar.

import type { PaginationParams } from './Pagination';
import type { FilterParams } from './Filters';
import type { SortingParams } from './Sorting';
import type { RequestMetadata } from './Metadata';

export interface CoreRequest<Params = unknown> {
  params?: Params;
  pagination?: PaginationParams;
  filters?: FilterParams;
  sorting?: SortingParams;
  metadata?: RequestMetadata;
}
