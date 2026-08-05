import type { Condition } from './Condition';

/** Contrato de persistência de Condition — apenas o contrato. */
export interface ConditionRepository {
  create(condition: Condition): Promise<Condition>;
  get(conditionId: string): Promise<Condition | undefined>;
}
