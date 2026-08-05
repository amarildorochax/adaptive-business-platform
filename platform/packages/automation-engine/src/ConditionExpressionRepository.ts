import type { ConditionExpression } from './ConditionExpression';

/** Contrato de persistência de Condition Expression — apenas o contrato. */
export interface ConditionExpressionRepository {
  create(expression: ConditionExpression): Promise<ConditionExpression>;
  get(conditionExpressionId: string): Promise<ConditionExpression | undefined>;
}
