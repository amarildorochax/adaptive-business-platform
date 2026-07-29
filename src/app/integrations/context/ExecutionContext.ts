// ExecutionContext.ts
//
// Responsabilidade:
// Estado da execução em andamento — módulo, tentativa atual (para
// `RetryMiddleware`, ainda sem laço de retry real) e horário de início
// (usado para calcular `durationMs` em `ResponseMetadata`).

import type { CoreModuleId } from '../types/ModuleId';

export interface ExecutionContext {
  moduleId: CoreModuleId;
  attempt: number;
  startedAt: string;
}
