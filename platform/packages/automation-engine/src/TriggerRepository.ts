import type { Trigger } from './Trigger';

/** Contrato de persistência de Trigger — apenas o contrato. */
export interface TriggerRepository {
  create(trigger: Trigger): Promise<Trigger>;
  get(triggerId: string): Promise<Trigger | undefined>;
  list(tenantId: string): Promise<Trigger[]>;
}
