// PipelineFactory.ts
//
// Responsabilidade:
// Constrói o `IntegrationPipeline` padrão a partir de todos os
// Middlewares em `middlewareRegistry` (na ordem de `priority`) — o
// mesmo pipeline usado por todos os 13 Adapters desta Sprint. Uma
// Sprint futura pode montar um pipeline diferente por módulo via
// `PipelineBuilder` diretamente, sem depender desta fábrica.

import { PipelineBuilder } from '../pipeline/PipelineBuilder';
import { IntegrationPipeline } from '../pipeline/IntegrationPipeline';
import { middlewareRegistry } from './MiddlewareRegistry';

export function createDefaultPipeline(): IntegrationPipeline {
  return new PipelineBuilder().useMany(middlewareRegistry.getAll()).build();
}
