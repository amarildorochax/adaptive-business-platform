// BootPipeline.ts
//
// Responsabilidade:
// Especialização de Pipeline (infraestrutura genérica e reutilizável em
// src/core/pipeline/Pipeline.ts) para o processo de boot da plataforma.
//
// Pipeline é a infraestrutura reutilizável — register/list/clear e a
// execução real (Sprint B.1) vivem lá, uma única vez, para que qualquer
// pipeline da plataforma (Boot hoje; Lifecycle, Shutdown, Update,
// Migration, Plugin, Install no futuro) os reutilize sem duplicação.
// BootPipeline é apenas UMA implementação dessa infraestrutura: dá ao
// boot uma identidade própria e um lugar para especializações futuras,
// sem redefinir nem duplicar register/list/clear/execute.
//
// Sprint B.3: o construtor passou a registrar automaticamente, nesta
// ordem, as três Boot Steps de src/core/platform/steps/ —
// InitializeRuntimeStep, ValidateRuntimeStep, FinalizeRuntimeStep —
// usando apenas o register() já existente em Pipeline. Nenhuma outra
// alteração foi feita. Essas etapas são puramente estruturais (execute/
// rollback vazios) e não acessam Runtime, Registry, Loaders, EventBus,
// Connectors, Modules ou Automation.
//
// É a única coisa que o PlatformRuntime conhece do processo de boot —
// o PlatformRuntime nunca lida com uma PipelineStep individualmente,
// apenas com o BootPipeline como um todo.
//
// Não é um Singleton: cada instância de BootPipeline tem sua própria
// lista de etapas (herdada de Pipeline).

import { Pipeline } from '../pipeline/Pipeline';
import { InitializeRuntimeStep } from './steps/InitializeRuntimeStep';
import { ValidateRuntimeStep } from './steps/ValidateRuntimeStep';
import { FinalizeRuntimeStep } from './steps/FinalizeRuntimeStep';

export class BootPipeline extends Pipeline {
  constructor() {
    super();

    this.register(new InitializeRuntimeStep());
    this.register(new ValidateRuntimeStep());
    this.register(new FinalizeRuntimeStep());
  }
}
