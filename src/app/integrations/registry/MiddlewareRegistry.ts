// MiddlewareRegistry.ts
//
// Responsabilidade:
// Catálogo de Middlewares disponíveis, indexado por nome — permite
// registrar um novo Middleware dinamicamente (`register`) sem alterar
// `middlewares/index.ts` nem `PipelineFactory`. Mesmo padrão de
// registry já usado por `DashboardWidgetRegistry` (Sprint 28) e
// `IntegrationRegistry` (Sprint 30).

import { allPipelineMiddlewares } from '../middlewares';
import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';

export class MiddlewareRegistry {
  private middlewares = new Map<string, PipelineMiddleware>();

  register(middleware: PipelineMiddleware): void {
    this.middlewares.set(middleware.name, middleware);
  }

  registerMany(middlewares: PipelineMiddleware[]): void {
    middlewares.forEach((middleware) => this.register(middleware));
  }

  unregister(name: string): void {
    this.middlewares.delete(name);
  }

  get(name: string): PipelineMiddleware | undefined {
    return this.middlewares.get(name);
  }

  getAll(): PipelineMiddleware[] {
    return Array.from(this.middlewares.values());
  }
}

/** Instância única e compartilhada, já populada com os 13 Middlewares desta Sprint. */
export const middlewareRegistry = new MiddlewareRegistry();
middlewareRegistry.registerMany(allPipelineMiddlewares);
