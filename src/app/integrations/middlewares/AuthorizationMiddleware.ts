// AuthorizationMiddleware.ts
//
// Responsabilidade:
// Ponto de extensão para autorização de alto nível (ex.: "este
// `UserContext` pode acessar este módulo?") — distinto de
// `PermissionsMiddleware` (autorização fina, por operação/recurso).
// Nenhuma regra real nesta Sprint — sempre autoriza.

import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';
import type { PipelineContext } from '../context/PipelineContext';

export const authorizationMiddleware: PipelineMiddleware = {
  name: 'authorization',
  priority: 40,

  beforeExecute(context: PipelineContext): PipelineContext {
    return context;
  },
};
