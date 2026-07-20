// PlatformRuntime.ts
//
// Responsabilidade:
// Ponto único de composição do runtime da plataforma. Reúne as peças que
// futuramente vão controlar todo o ciclo de vida da aplicação —
// BootManager, LifecycleManager, ModuleLoader, ConnectorLoader e
// AutomationLoader — e mantém o RuntimeState atual. Implementa
// ILifecycle como contrato de ciclo de vida da própria instância de
// runtime.
//
// Nenhuma integração com o bootstrap/runtime atual da aplicação
// (src/core/bootstrap/startPlatform.ts), com o EventBus, com o
// AgentRegistry, com PlatformRegistry ou com os Loaders — nada aqui é
// chamado por nenhum outro ponto do código.
//
// Sprint A.4 acrescentou `bootPipeline`: o PlatformRuntime conhece
// apenas o BootPipeline como um todo — nunca uma PipelineStep
// individual, nem PipelineContext, nem PipelineResult diretamente.
//
// Sprint B.2 implementou o ciclo de vida real (init/start/stop), que
// transiciona RuntimeState e, em init(), chama bootPipeline.execute()
// (herdado de Pipeline — ver src/core/pipeline/Pipeline.ts) para
// decidir entre INITIALIZED e ERROR. Nenhuma etapa de boot concreta
// existe ainda; nenhum módulo/conector/automação é carregado aqui.
// dispose() permanece vazio.

import type { ILifecycle } from "@/shared/interfaces";
import { RuntimeState } from "./RuntimeState";
import { BootManager } from "./BootManager";
import { LifecycleManager } from "./LifecycleManager";
import { ModuleLoader } from "./ModuleLoader";
import { ConnectorLoader } from "./ConnectorLoader";
import { AutomationLoader } from "./AutomationLoader";
import { BootPipeline } from "./BootPipeline";

export class PlatformRuntime implements ILifecycle {
  private state: RuntimeState = RuntimeState.CREATED;

  readonly bootManager = new BootManager();

  readonly lifecycleManager = new LifecycleManager();

  readonly moduleLoader = new ModuleLoader();

  readonly connectorLoader = new ConnectorLoader();

  readonly automationLoader = new AutomationLoader();

  private readonly bootPipeline: BootPipeline;

  constructor() {
    this.bootPipeline = new BootPipeline();
  }

  getState(): RuntimeState {
    return this.state;
  }

  // Único ponto de acesso ao BootPipeline — quem precisar dele (ex.:
  // BootManager, em uma etapa futura) passa por aqui, nunca acessando
  // uma BootStep diretamente. Não chama execute() nem nenhum outro
  // método do pipeline.
  getBootPipeline(): BootPipeline {
    return this.bootPipeline;
  }

  // CREATED -> INITIALIZING -> bootPipeline.execute() -> INITIALIZED | ERROR.
  // Se o estado não for CREATED, não faz nada (init só roda uma vez).
  init(): void {
    if (this.state !== RuntimeState.CREATED) {
      return;
    }

    this.state = RuntimeState.INITIALIZING;

    const result = this.bootPipeline.execute();

    this.state = result.success
      ? RuntimeState.INITIALIZED
      : RuntimeState.ERROR;
  }

  // STARTING -> RUNNING, somente a partir de INITIALIZED.
  // Em qualquer outro estado, não faz nada.
  start(): void {
    if (this.state !== RuntimeState.INITIALIZED) {
      return;
    }

    this.state = RuntimeState.STARTING;
    this.state = RuntimeState.RUNNING;
  }

  // STOPPING -> STOPPED, somente a partir de RUNNING.
  // Em qualquer outro estado, não faz nada.
  stop(): void {
    if (this.state !== RuntimeState.RUNNING) {
      return;
    }

    this.state = RuntimeState.STOPPING;
    this.state = RuntimeState.STOPPED;
  }

  // Sem comportamento nesta etapa, por instrução da Sprint B.2.
  dispose(): void {}
}
