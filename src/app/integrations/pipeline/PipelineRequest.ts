// PipelineRequest.ts
//
// Responsabilidade:
// Envelope de entrada do Integration Pipeline — o que um Adapter passa
// ao `PipelineExecutor`. `payload` carrega o `CoreRequest`/comando
// original do Adapter (Sprint 30), sem reinterpretá-lo.

import type { CoreModuleId } from '../types/ModuleId';

export type PipelineOperation = 'query' | 'mutate';

export interface PipelineRequest<Payload = unknown> {
  moduleId: CoreModuleId;
  operation: PipelineOperation;
  payload: Payload;
}
