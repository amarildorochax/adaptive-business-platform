// FinalizeRuntimeStep.ts
//
// Responsabilidade futura:
// Representa a etapa final do boot — o lugar reservado para,
// futuramente, encerrar o processo de inicialização (ex.: liberar
// qualquer recurso temporário usado só durante o boot).
//
// Quando será utilizada:
// Sempre como a terceira e última etapa registrada no BootPipeline,
// depois de InitializeRuntimeStep e ValidateRuntimeStep.
//
// Por que existe:
// Para que o boot tenha um encerramento explícito e único, em vez de
// "terminar" implicitamente quando a última etapa qualquer acabar —
// deixa claro, na leitura do BootPipeline, onde o processo de
// inicialização se considera concluído.
//
// Nesta Sprint, execute() e rollback() permanecem vazios — não acessam
// Runtime, Registry, Loaders, EventBus, Connectors, Modules ou
// Automation.

import type { PipelineContext } from '../../pipeline/PipelineContext';
import { BaseBootStep } from './BaseBootStep';

export class FinalizeRuntimeStep extends BaseBootStep {
  readonly name = 'finalize-runtime';

  execute(_context: PipelineContext): void {}

  rollback(_context: PipelineContext): void {}
}
