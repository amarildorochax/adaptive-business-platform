// PipelineBuilder.ts
//
// Responsabilidade:
// Builder fluente para montar um `IntegrationPipeline` com um conjunto
// escolhido de Middlewares — usado por `registry/PipelineFactory` para
// montar o pipeline padrão, e disponível para qualquer Sprint futura
// que precise de um pipeline com um subconjunto diferente de
// Middlewares (ex.: um módulo que dispense Cache).

import { IntegrationPipeline } from './IntegrationPipeline';
import type { PipelineMiddleware } from '../contracts/PipelineMiddleware';

export class PipelineBuilder {
  private readonly middlewares: PipelineMiddleware[] = [];

  use(middleware: PipelineMiddleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  useMany(middlewares: PipelineMiddleware[]): this {
    this.middlewares.push(...middlewares);
    return this;
  }

  build(): IntegrationPipeline {
    return new IntegrationPipeline(this.middlewares);
  }
}
