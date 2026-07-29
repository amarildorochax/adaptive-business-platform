// PlatformRuntime.ts
//
// Responsabilidade:
// Ponto único de composição do runtime da plataforma. Reúne as peças que
// controlam todo o ciclo de vida da aplicação — BootManager,
// LifecycleManager, ModuleLoader/ModuleRegistry, ConnectorLoader/
// ConnectorRegistry, AutomationLoader — e mantém o RuntimeState atual.
// Implementa ILifecycle como contrato de ciclo de vida da própria
// instância de runtime.
//
// Sprint 0B — Integração do Runtime: PlatformRuntime passa a ser
// efetivamente utilizado pelo bootstrap real (via Platform, ver
// Platform.ts). `init()` executa o BootPipeline real (carrega e inicia
// módulos, conectores e automações — ver InitializeRuntimeStep/
// FinalizeRuntimeStep). `start()`, além de transicionar RuntimeState,
// inicia o AgentSimulator ("AgentRuntime" do diagrama desta Sprint não é
// uma classe própria — PlatformRuntime já cumpre esse papel, iniciando
// AgentSimulator ao entrar em RUNNING; nenhuma arquitetura nova foi
// criada para isso). `stop()` interrompe o AgentSimulator.
//
// dispose() permanece vazio — reservado para liberar recursos quando
// existir algum.

import type { ILifecycle } from "@/shared/interfaces";
import { RuntimeState } from "./RuntimeState";
import { BootManager } from "./BootManager";
import { LifecycleManager } from "./LifecycleManager";
import { ModuleLoader } from "./ModuleLoader";
import { ModuleRegistry } from "./ModuleRegistry";
import { ConnectorLoader } from "./ConnectorLoader";
import { AutomationLoader } from "./AutomationLoader";
import { BootPipeline } from "./BootPipeline";
import { ConnectorRegistry } from "../connectors/ConnectorRegistry";
import { AgentSimulator } from "../simulation/AgentSimulator";
import { eventBus } from "../events/EventBus";
import { EventTypes } from "../events/EventTypes";

export class PlatformRuntime implements ILifecycle {
  private state: RuntimeState = RuntimeState.CREATED;

  readonly bootManager = new BootManager();

  readonly lifecycleManager = new LifecycleManager();

  readonly moduleLoader = new ModuleLoader();

  readonly moduleRegistry = new ModuleRegistry();

  readonly connectorLoader = new ConnectorLoader();

  readonly connectorRegistry = new ConnectorRegistry();

  readonly automationLoader = new AutomationLoader();

  /** Agente que a plataforma passa a supervisionar assim que o runtime entra em RUNNING. */
  readonly agentSimulator = new AgentSimulator();

  private readonly bootPipeline: BootPipeline;

  constructor() {
    this.bootPipeline = new BootPipeline({
      moduleLoader: this.moduleLoader,
      moduleRegistry: this.moduleRegistry,
      connectorLoader: this.connectorLoader,
      connectorRegistry: this.connectorRegistry,
      automationLoader: this.automationLoader,
    });
  }

  getState(): RuntimeState {
    return this.state;
  }

  // Único ponto de acesso ao BootPipeline — quem precisar dele (ex.:
  // BootManager, em uma etapa futura) passa por aqui, nunca acessando
  // uma BootStep diretamente.
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

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.PLATFORM_BOOT_STARTED,
      source: "PlatformRuntime",
      createdAt: new Date(),
    });

    const result = this.bootPipeline.execute();

    if (result.success) {
      this.state = RuntimeState.INITIALIZED;
    } else {
      this.state = RuntimeState.ERROR;

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.PLATFORM_BOOT_FAILED,
        source: "PlatformRuntime",
        payload: { errors: result.errors },
        createdAt: new Date(),
      });
    }
  }

  // STARTING -> RUNNING, somente a partir de INITIALIZED. Ao entrar em
  // RUNNING, inicia o AgentSimulator ("blog-agent", único Agent
  // executável hoje). Em qualquer outro estado, não faz nada.
  start(): void {
    if (this.state !== RuntimeState.INITIALIZED) {
      return;
    }

    this.state = RuntimeState.STARTING;
    this.state = RuntimeState.RUNNING;

    this.agentSimulator.start("blog-agent");
  }

  // STOPPING -> STOPPED, somente a partir de RUNNING. Interrompe o
  // AgentSimulator antes de concluir a transição. Em qualquer outro
  // estado, não faz nada.
  stop(): void {
    if (this.state !== RuntimeState.RUNNING) {
      return;
    }

    this.state = RuntimeState.STOPPING;

    this.agentSimulator.stop();

    this.state = RuntimeState.STOPPED;
  }

  // Sem comportamento nesta etapa.
  dispose(): void {}
}
