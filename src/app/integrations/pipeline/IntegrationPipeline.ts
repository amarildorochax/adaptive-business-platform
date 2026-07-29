// IntegrationPipeline.ts
//
// Responsabilidade:
// Fachada de alto nível do Integration Pipeline — o que um Adapter
// efetivamente consome. Combina um `PipelineExecutor` (já com seus
// Middlewares) com a construção do `PipelineContext` inicial
// (`createPipelineContext`), expondo um único método `run()`.

import { PipelineExecutor, type PipelineFinalHandler } from '../executor/PipelineExecutor';
import { createPipelineContext } from '../context/createPipelineContext';
import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';
import type { PipelineRequest } from './PipelineRequest';
import type { PipelineResponse } from './PipelineResponse';

export class IntegrationPipeline {
  private readonly executor: PipelineExecutor;

  constructor(middlewares: PipelineMiddleware[]) {
    this.executor = new PipelineExecutor(middlewares);
  }

  async run<Data, Payload = unknown>(
    request: PipelineRequest<Payload>,
    finalHandler: PipelineFinalHandler<Data>,
  ): Promise<PipelineResponse<Data>> {
    const context = createPipelineContext(request);
    return this.executor.execute(context, finalHandler);
  }
}
