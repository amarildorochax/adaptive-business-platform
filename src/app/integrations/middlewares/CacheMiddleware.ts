// CacheMiddleware.ts
//
// Responsabilidade:
// Consome o contrato de cache já reaproveitado da Sprint 29A
// (`contracts/cache.ts` → `@/app/features/dashboard/controllers/
// cache`). Com `noopCacheStrategy`, `get()` nunca retorna um hit e
// `set()` não persiste nada — nenhum cache real. Estrutura pronta para
// quando uma estratégia real (`WidgetCacheStrategy` concreta) for
// implementada, sem exigir mudança neste Middleware além de trocar a
// instância consumida.

import { noopCacheStrategy } from '../contracts/cache';
import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';
import type { PipelineContext } from '../context/PipelineContext';
import type { PipelineResponse } from '../pipeline/PipelineResponse';

export const cacheMiddleware: PipelineMiddleware = {
  name: 'cache',
  priority: 90,

  beforeExecute(context: PipelineContext): PipelineContext {
    noopCacheStrategy.get(`${context.request.moduleId}:${context.request.operation}`);
    return context;
  },

  afterExecute<Data>(context: PipelineContext, response: PipelineResponse<Data>): PipelineResponse<Data> {
    noopCacheStrategy.set(`${context.request.moduleId}:${context.request.operation}`, response.data, { mode: 'none' });
    return response;
  },
};
