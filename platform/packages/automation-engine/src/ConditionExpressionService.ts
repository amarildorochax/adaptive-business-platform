import type { ConditionExpression, ConditionOperator } from './ConditionExpression';
import type { ConditionExpressionRepository } from './ConditionExpressionRepository';

/** ConditionExpressionService — nenhum precedente legado equivalente foi encontrado. Nenhuma emissão de Evento/Audit aqui. */
export class ConditionExpressionService {
  constructor(private readonly repository: ConditionExpressionRepository) {}

  async combine(operator: ConditionOperator, conditionIds: readonly string[]): Promise<ConditionExpression> {
    const expression: ConditionExpression = { conditionExpressionId: crypto.randomUUID(), operator, conditionIds };
    return this.repository.create(expression);
  }

  async get(conditionExpressionId: string): Promise<ConditionExpression | undefined> {
    return this.repository.get(conditionExpressionId);
  }
}
