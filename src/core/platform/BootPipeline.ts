import { Pipeline } from '../pipeline/Pipeline';
import { InitializeRuntimeStep } from './steps/InitializeRuntimeStep';
import { ValidateRuntimeStep } from './steps/ValidateRuntimeStep';
import { FinalizeRuntimeStep } from './steps/FinalizeRuntimeStep';
import type { ModuleLoader } from './ModuleLoader';
import type { ModuleRegistry } from './ModuleRegistry';
import type { ConnectorLoader } from './ConnectorLoader';
import type { ConnectorRegistry } from '../connectors/ConnectorRegistry';
import type { AutomationLoader } from './AutomationLoader';

/** Dependências que o boot real precisa — todas já existentes em PlatformRuntime. */
export interface BootPipelineDependencies {
  moduleLoader: ModuleLoader;
  moduleRegistry: ModuleRegistry;
  connectorLoader: ConnectorLoader;
  connectorRegistry: ConnectorRegistry;
  automationLoader: AutomationLoader;
}

/**
 * Especialização de Pipeline (infraestrutura genérica e reutilizável em
 * src/core/pipeline/Pipeline.ts) para o processo de boot da plataforma.
 *
 * Responsabilidade: dar ao boot uma identidade própria — register/list/
 * clear/execute continuam vivendo em Pipeline, nunca redefinidos ou
 * duplicados aqui.
 *
 * Sprint 0B — Integração do Runtime: o construtor passou a exigir
 * `BootPipelineDependencies` — os mesmos ModuleLoader/ModuleRegistry/
 * ConnectorLoader/ConnectorRegistry/AutomationLoader já mantidos por
 * PlatformRuntime — e repassá-los a InitializeRuntimeStep. É a única
 * etapa que precisa deles; ValidateRuntimeStep e FinalizeRuntimeStep
 * consomem o resultado através de `PipelineContext.services`, nunca por
 * injeção direta.
 *
 * É a única coisa que o PlatformRuntime conhece do processo de boot — o
 * PlatformRuntime nunca lida com uma PipelineStep individualmente,
 * apenas com o BootPipeline como um todo.
 *
 * Não é um Singleton: cada instância de BootPipeline tem sua própria
 * lista de etapas.
 */
export class BootPipeline extends Pipeline {
  constructor(dependencies: BootPipelineDependencies) {
    super();

    this.register(
      new InitializeRuntimeStep(
        dependencies.moduleLoader,
        dependencies.moduleRegistry,
        dependencies.connectorLoader,
        dependencies.connectorRegistry,
        dependencies.automationLoader
      )
    );
    this.register(new ValidateRuntimeStep());
    this.register(new FinalizeRuntimeStep());
  }
}
