// InitializeRuntimeStep.ts
//
// Responsabilidade futura:
// Representa a primeira etapa do boot da plataforma — o lugar reservado
// para, futuramente, preparar o que as demais etapas vão precisar (ex.:
// garantir que o PipelineContext tenha os dados iniciais corretos antes
// de qualquer outra etapa rodar).
//
// Quando será utilizada:
// Sempre como a primeira etapa registrada no BootPipeline, antes de
// ValidateRuntimeStep e FinalizeRuntimeStep — a ordem de registro em
// BootPipeline.ts reflete essa intenção.
//
// Por que existe:
// Para que o fluxo PlatformRuntime -> BootPipeline -> BootSteps ->
// PipelineResult tenha pelo menos uma etapa real percorrendo o
// pipeline, validando a infraestrutura de execução construída na
// Sprint B.1 mesmo sem nenhuma regra de negócio ainda.
//
// Nesta Sprint, execute() e rollback() permanecem vazios — não acessam
// Runtime, Registry, Loaders, EventBus, Connectors, Modules ou
// Automation.

import type { PipelineContext } from '../../pipeline/PipelineContext';
import { BaseBootStep } from './BaseBootStep';

export class InitializeRuntimeStep extends BaseBootStep {
  readonly name = 'initialize-runtime';

  execute(_context: PipelineContext): void {}

  rollback(_context: PipelineContext): void {}
}
