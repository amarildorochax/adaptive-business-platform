import type { PipelineContext } from '../../pipeline/PipelineContext';
import { BaseBootStep } from './BaseBootStep';
import type { LoadedServices } from './InitializeRuntimeStep';
import { eventBus } from '../../events/EventBus';
import { EventTypes } from '../../events/EventTypes';

/**
 * Terceira e última etapa do boot: chama `start()` em todos os módulos,
 * conectores, e automações já validados por ValidateRuntimeStep,
 * progredindo seu ciclo de vida de "inicializado" para "iniciado".
 *
 * Responsabilidade (Sprint 0B — Integração do Runtime): encerramento
 * explícito do processo de boot — nenhuma regra de negócio é executada
 * aqui, apenas a chamada de `start()` já prevista por ILifecycle/
 * IModule/IConnector/IAutomation.
 *
 * Ordem: sempre a terceira e última etapa registrada no BootPipeline.
 */
export class FinalizeRuntimeStep extends BaseBootStep {
  readonly name = 'finalize-runtime';

  execute(context: PipelineContext): void {
    const services = context.services as LoadedServices;

    for (const module of services.modules) {
      module.start();
    }

    for (const connector of services.connectors) {
      connector.start();
    }

    for (const automation of services.automations) {
      automation.start();
    }

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.PLATFORM_BOOT_COMPLETED,
      source: 'FinalizeRuntimeStep',
      payload: {
        modules: services.modules.length,
        connectors: services.connectors.length,
        automations: services.automations.length,
      },
      createdAt: new Date(),
    });
  }

  rollback(_context: PipelineContext): void {}
}
