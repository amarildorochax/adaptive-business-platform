// PipelineRegistry.ts
//
// Responsabilidade:
// Catálogo de `IntegrationPipeline` por `CoreModuleId` — permite que um
// módulo futuro use um pipeline diferente do padrão (ex.: um módulo que
// precise pular `CacheMiddleware`) sem afetar os demais. Todo módulo
// não registrado explicitamente cai de volta no pipeline padrão
// (`createDefaultPipeline()`).

import { createDefaultPipeline } from './PipelineFactory';
import type { IntegrationPipeline } from '../pipeline/IntegrationPipeline';
import type { CoreModuleId } from '../types/ModuleId';

export class PipelineRegistry {
  private pipelines = new Map<CoreModuleId, IntegrationPipeline>();
  private readonly defaultPipeline: IntegrationPipeline;

  constructor(defaultPipeline: IntegrationPipeline) {
    this.defaultPipeline = defaultPipeline;
  }

  register(moduleId: CoreModuleId, pipeline: IntegrationPipeline): void {
    this.pipelines.set(moduleId, pipeline);
  }

  resolve(moduleId: CoreModuleId): IntegrationPipeline {
    return this.pipelines.get(moduleId) ?? this.defaultPipeline;
  }
}

/** Instância única e compartilhada — todo módulo usa o pipeline padrão até ser registrado explicitamente. */
export const pipelineRegistry = new PipelineRegistry(createDefaultPipeline());
