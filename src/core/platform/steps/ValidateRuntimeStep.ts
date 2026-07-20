// ValidateRuntimeStep.ts
//
// Responsabilidade futura:
// Representa a etapa de validação do boot — o lugar reservado para,
// futuramente, conferir se o que InitializeRuntimeStep preparou está
// consistente antes de FinalizeRuntimeStep concluir o processo.
//
// Quando será utilizada:
// Sempre como a segunda etapa registrada no BootPipeline, entre
// InitializeRuntimeStep e FinalizeRuntimeStep.
//
// Por que existe:
// Para reservar, desde já, um ponto único de validação de boot — em vez
// de cada etapa futura validar suas próprias pré-condições de forma
// espalhada, há um lugar dedicado a isso na ordem do pipeline.
//
// Nesta Sprint não há nenhuma validação real: execute() e rollback()
// permanecem vazios — não acessam Runtime, Registry, Loaders, EventBus,
// Connectors, Modules ou Automation.

import type { PipelineContext } from '../../pipeline/PipelineContext';
import { BaseBootStep } from './BaseBootStep';

export class ValidateRuntimeStep extends BaseBootStep {
  readonly name = 'validate-runtime';

  execute(_context: PipelineContext): void {}

  rollback(_context: PipelineContext): void {}
}
