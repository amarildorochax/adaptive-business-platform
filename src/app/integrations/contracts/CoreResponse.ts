// CoreResponse.ts
//
// Responsabilidade:
// Envelope genérico de resposta da camada de integração — o único
// formato que um Adapter devolve. `data` é sempre um ViewModel do
// Frontend (ver `mappers/`), nunca um DTO do Core exposto diretamente.

import type { PaginationInfo } from './Pagination';
import type { ResponseMetadata } from './Metadata';

export interface CoreResponse<Data> {
  data: Data;
  pagination?: PaginationInfo;
  metadata: ResponseMetadata;
}
