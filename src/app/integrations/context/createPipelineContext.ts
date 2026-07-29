// createPipelineContext.ts
//
// Responsabilidade:
// Constrói o `PipelineContext` inicial para uma `PipelineRequest` — os
// campos de rastreabilidade (`correlationId`/`requestId`) começam
// vazios e são preenchidos por `CorrelationIdMiddleware`/
// `RequestIdMiddleware` (não aqui), para que a geração desses valores
// fique centralizada nos Middlewares responsáveis, não duplicada neste
// construtor.

import type { PipelineRequest } from '../pipeline/PipelineRequest';
import type { PipelineContext } from './PipelineContext';
import { anonymousUserContext } from './UserContext';

export function createPipelineContext<Payload>(request: PipelineRequest<Payload>): PipelineContext<Payload> {
  const now = new Date().toISOString();

  return {
    request,
    userContext: anonymousUserContext,
    requestContext: { correlationId: '', requestId: '', issuedAt: now },
    executionContext: { moduleId: request.moduleId, attempt: 1, startedAt: now },
    environmentContext: { mode: 'development' },
  };
}
