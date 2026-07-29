// PermissionsMiddleware.ts
//
// Responsabilidade:
// Ponto de extensão para autorização fina (por operação/módulo) —
// consultaria `context.userContext.roles` contra uma política real.
// Nenhuma regra real nesta Sprint — sempre autoriza.

import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';
import type { PipelineContext } from '../context/PipelineContext';

export const permissionsMiddleware: PipelineMiddleware = {
  name: 'permissions',
  priority: 50,

  beforeExecute(context: PipelineContext): PipelineContext {
    return context;
  },
};
