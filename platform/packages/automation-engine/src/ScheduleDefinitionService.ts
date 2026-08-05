import type { ScheduleDefinition, ScheduleKind } from './ScheduleDefinition';
import type { ScheduleDefinitionRepository } from './ScheduleDefinitionRepository';
import type { Trigger } from './Trigger';

/**
 * ScheduleDefinitionService — nenhum precedente legado equivalente foi encontrado (nenhum dos módulos
 * de agendamento legados — `src/core/execution-scheduling/`, `src/core/orchestrator/` — modela
 * agendamento de automação de negócio; ambos pertencem à execução de Agente de IA, um domínio
 * diferente, ver relatório desta Sprint). `define` exige um Trigger de categoria `"Time"` já
 * registrado — Time-aware Automation (`AUTOMATION_ENGINE.md`, Capítulo 5) nunca é uma adaptação
 * improvisada sobre um Trigger de outra categoria. Nenhuma emissão de Evento/Audit aqui.
 */
export class ScheduleDefinitionService {
  constructor(private readonly repository: ScheduleDefinitionRepository) {}

  async define(trigger: Trigger, kind: ScheduleKind, description: string): Promise<ScheduleDefinition> {
    if (trigger.category !== 'Time') {
      throw new Error(`Trigger ${trigger.triggerId} não é da categoria "Time" — Schedule Definition exige um Trigger temporal.`);
    }

    const schedule: ScheduleDefinition = { scheduleDefinitionId: crypto.randomUUID(), triggerId: trigger.triggerId, kind, description };
    return this.repository.create(schedule);
  }

  async findByTrigger(triggerId: string): Promise<ScheduleDefinition | undefined> {
    return this.repository.findByTrigger(triggerId);
  }
}
