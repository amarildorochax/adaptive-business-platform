import type { ScheduleDefinition } from './ScheduleDefinition';

/** Contrato de persistência de Schedule Definition — apenas o contrato. */
export interface ScheduleDefinitionRepository {
  create(schedule: ScheduleDefinition): Promise<ScheduleDefinition>;
  findByTrigger(triggerId: string): Promise<ScheduleDefinition | undefined>;
}
