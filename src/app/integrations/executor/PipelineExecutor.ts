// PipelineExecutor.ts
//
// Responsabilidade:
// Motor de execução do Integration Pipeline — ordena os Middlewares
// registrados por `priority`/`order`, roda `beforeExecute` de cada um
// (na ordem), então o `finalHandler` (a chamada real ao Core Facade —
// nesta Sprint, sempre um handler que lança `ModuleUnavailableError`,
// fornecido pelo Adapter), depois `afterExecute` de cada um (na ordem
// inversa, padrão "cebola" de middleware), e finalmente `onError` de
// todos caso qualquer etapa lance.
//
// Desacoplado dos Adapters: nunca importa `core/adapters/*` — apenas
// recebe o `finalHandler` como parâmetro.

import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';
import type { PipelineContext } from '../context/PipelineContext';
import type { PipelineResponse } from '../pipeline/PipelineResponse';
import { normalizeError } from '../errors/normalizeError';

export type PipelineFinalHandler<Data> = (context: PipelineContext) => Promise<PipelineResponse<Data>>;

function sortMiddlewares(middlewares: PipelineMiddleware[]): PipelineMiddleware[] {
  return [...middlewares].sort((a, b) => (a.priority - b.priority) || ((a.order ?? 0) - (b.order ?? 0)));
}

export class PipelineExecutor {
  constructor(private readonly middlewares: PipelineMiddleware[]) {}

  async execute<Data>(initialContext: PipelineContext, finalHandler: PipelineFinalHandler<Data>): Promise<PipelineResponse<Data>> {
    const active = sortMiddlewares(this.middlewares).filter((middleware) => middleware.shouldExecute?.(initialContext) ?? true);

    let context = initialContext;

    try {
      for (const middleware of active) {
        if (middleware.beforeExecute) {
          context = await middleware.beforeExecute(context);
        }
      }

      let response = await finalHandler(context);

      for (const middleware of [...active].reverse()) {
        if (middleware.afterExecute) {
          response = await middleware.afterExecute(context, response);
        }
      }

      return response;
    } catch (caught) {
      const error = normalizeError(caught, context.request.moduleId);
      for (const middleware of active) {
        await middleware.onError?.(context, error);
      }
      throw error;
    }
  }
}
