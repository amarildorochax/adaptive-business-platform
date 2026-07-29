// PipelineResponse.ts
//
// Responsabilidade:
// Envelope de saída do Integration Pipeline — reaproveita
// `ResponseMetadata` da Sprint 30, sem duplicar o conceito.

import type { ResponseMetadata } from '../contracts/Metadata';

export interface PipelineResponse<Data = unknown> {
  data: Data;
  metadata: ResponseMetadata;
}
