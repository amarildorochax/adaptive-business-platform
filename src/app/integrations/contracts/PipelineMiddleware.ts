// PipelineMiddleware.ts
//
// Responsabilidade:
// Contrato único implementado por todo Middleware do Integration
// Pipeline — `shouldExecute`/`beforeExecute`/`afterExecute`/`onError`,
// mais `priority`/`order` para determinar a sequência de execução
// (`PipelineExecutor` ordena por `priority` crescente, usando `order`
// como critério de desempate). Nenhum método é obrigatório além de
// `name`/`priority` — um Middleware pode implementar só o que precisar.

import type { PipelineContext } from '../context/PipelineContext';
import type { PipelineResponse } from '../pipeline/PipelineResponse';
import type { CoreIntegrationError } from '../errors/CoreIntegrationError';

export interface PipelineMiddleware {
  readonly name: string;
  readonly priority: number;
  readonly order?: number;

  shouldExecute?(context: PipelineContext): boolean;
  beforeExecute?(context: PipelineContext): Promise<PipelineContext> | PipelineContext;
  afterExecute?<Data>(context: PipelineContext, response: PipelineResponse<Data>): Promise<PipelineResponse<Data>> | PipelineResponse<Data>;
  onError?(context: PipelineContext, error: CoreIntegrationError): Promise<void> | void;
}
