// AuthenticationMiddleware.ts
//
// Responsabilidade:
// Ponto de extensão para autenticação — nesta Sprint apenas repassa o
// `userContext` já presente no `PipelineContext` (sempre
// `anonymousUserContext` até uma Sprint futura de Auth). Nenhuma
// verificação real de sessão/token ocorre aqui.

import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';
import type { PipelineContext } from '../context/PipelineContext';

export const authenticationMiddleware: PipelineMiddleware = {
  name: 'authentication',
  priority: 30,

  beforeExecute(context: PipelineContext): PipelineContext {
    return context;
  },
};
