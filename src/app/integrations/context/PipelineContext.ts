// PipelineContext.ts
//
// Responsabilidade:
// Contexto completo carregado por uma execução do Integration Pipeline
// — combina o `PipelineRequest` original com os 4 contextos exigidos
// pelo ESCOPO (User/Request/Execution/Environment). Passado por
// referência através de todos os Middlewares; cada `beforeExecute` pode
// retornar uma cópia atualizada (nunca mutar o objeto recebido).

import type { PipelineRequest } from '../pipeline/PipelineRequest';
import type { UserContext } from './UserContext';
import type { RequestContext } from './RequestContext';
import type { ExecutionContext } from './ExecutionContext';
import type { EnvironmentContext } from './EnvironmentContext';

export interface PipelineContext<Payload = unknown> {
  request: PipelineRequest<Payload>;
  userContext: UserContext;
  requestContext: RequestContext;
  executionContext: ExecutionContext;
  environmentContext: EnvironmentContext;
}
