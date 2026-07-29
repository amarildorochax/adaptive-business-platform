import type { PipelineContext } from '../../pipeline/PipelineContext';
import { BaseBootStep } from './BaseBootStep';
import type { LoadedServices } from './InitializeRuntimeStep';

/**
 * Segunda etapa do boot: confere que InitializeRuntimeStep deixou
 * `context.services` no formato esperado (LoadedServices) antes de
 * FinalizeRuntimeStep prosseguir.
 *
 * Responsabilidade (Sprint 0B — Integração do Runtime): validação
 * estrutural pura — confirma que os três arrays (`modules`,
 * `connectors`, `automations`) existem — nunca avalia regra de negócio
 * de nenhum módulo ou automação individual.
 *
 * Ordem: sempre a segunda etapa, entre InitializeRuntimeStep e
 * FinalizeRuntimeStep. Lançar aqui interrompe o Pipeline (ver
 * Pipeline.execute()), impedindo FinalizeRuntimeStep de rodar sobre um
 * contexto inconsistente.
 */
export class ValidateRuntimeStep extends BaseBootStep {
  readonly name = 'validate-runtime';

  execute(context: PipelineContext): void {
    const services = context.services as LoadedServices | undefined;

    if (
      !services ||
      !Array.isArray(services.modules) ||
      !Array.isArray(services.connectors) ||
      !Array.isArray(services.automations)
    ) {
      throw new Error(
        'ValidateRuntimeStep: context.services ausente ou em formato inválido — InitializeRuntimeStep deveria tê-lo preenchido.'
      );
    }
  }

  rollback(_context: PipelineContext): void {}
}
