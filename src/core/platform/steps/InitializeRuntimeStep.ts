import type { IModule, IConnector, IAutomation } from '@/shared/interfaces';
import type { PipelineContext } from '../../pipeline/PipelineContext';
import { BaseBootStep } from './BaseBootStep';
import type { ModuleLoader } from '../ModuleLoader';
import type { ModuleRegistry } from '../ModuleRegistry';
import type { ConnectorLoader } from '../ConnectorLoader';
import type { ConnectorRegistry } from '../../connectors/ConnectorRegistry';
import type { AutomationLoader } from '../AutomationLoader';
import { eventBus } from '../../events/EventBus';
import { EventTypes } from '../../events/EventTypes';

/**
 * Formato armazenado em `context.services` por esta etapa — consumido
 * por ValidateRuntimeStep e por FinalizeRuntimeStep. `context.services`
 * permanece tipado `unknown` em PipelineContext (evita o ciclo já
 * documentado ali); esta interface é o contrato interno usado pelas
 * três Boot Steps para o narrowing de tipo necessário.
 */
export interface LoadedServices {
  modules: IModule[];
  connectors: IConnector[];
  automations: IAutomation[];
}

/**
 * Primeira etapa do boot: carrega e registra os módulos de negócio, os
 * conectores, e os motores de automação, e chama `init()` em cada um.
 *
 * Responsabilidade (Sprint 0B — Integração do Runtime): esta etapa
 * deixa de ser um stub vazio e passa a realizar o carregamento real
 * descrito em BootPipeline. Os componentes carregados (módulos,
 * conectores, automações) são guardados em `context.services` para que
 * ValidateRuntimeStep os confira e FinalizeRuntimeStep os inicie
 * (`start()`) — `context.services` é `unknown` de propósito (ver
 * PipelineContext.ts), então cada etapa faz seu próprio narrowing de
 * tipo.
 *
 * Ordem: sempre a primeira etapa registrada no BootPipeline.
 *
 * Dependências: ModuleLoader, ModuleRegistry, ConnectorLoader,
 * ConnectorRegistry, AutomationLoader — todos recebidos via construtor,
 * nunca importados de PlatformRuntime diretamente (evita o ciclo já
 * documentado em PipelineContext.ts).
 */
export class InitializeRuntimeStep extends BaseBootStep {
  readonly name = 'initialize-runtime';

  constructor(
    private readonly moduleLoader: ModuleLoader,
    private readonly moduleRegistry: ModuleRegistry,
    private readonly connectorLoader: ConnectorLoader,
    private readonly connectorRegistry: ConnectorRegistry,
    private readonly automationLoader: AutomationLoader
  ) {
    super();
  }

  execute(context: PipelineContext): void {
    const modules = this.moduleLoader.load();

    for (const module of modules) {
      this.moduleRegistry.register(module);
      module.init();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.MODULE_LOADED,
        source: 'InitializeRuntimeStep',
        payload: { moduleId: module.id, name: module.name },
        createdAt: new Date(),
      });
    }

    const connectors = this.connectorLoader.load();

    for (const connector of connectors) {
      this.connectorRegistry.register(connector);
      connector.init();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.CONNECTOR_LOADED,
        source: 'InitializeRuntimeStep',
        payload: { connectorId: connector.id },
        createdAt: new Date(),
      });
    }

    const automations = this.automationLoader.load();

    for (const automation of automations) {
      automation.init();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.AUTOMATION_LOADED,
        source: 'InitializeRuntimeStep',
        payload: { automationId: automation.id },
        createdAt: new Date(),
      });
    }

    context.services = { modules, connectors, automations };
  }

  rollback(_context: PipelineContext): void {}
}
