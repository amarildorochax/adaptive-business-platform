import type { Condition, ConditionKind } from './Condition';
import type { ConditionRepository } from './ConditionRepository';

/** ConditionService — nenhum precedente legado equivalente foi encontrado (`AutomationTrigger.conditions`, legado, é um `Record<string, unknown>` livre nunca interpretado — o Blueprint já aprovado modela Condition como Entidade própria, com sete categorias fechadas). Nenhuma emissão de Evento/Audit aqui. */
export class ConditionService {
  constructor(private readonly repository: ConditionRepository) {}

  async define(kind: ConditionKind, description: string): Promise<Condition> {
    const condition: Condition = { conditionId: crypto.randomUUID(), kind, description };
    return this.repository.create(condition);
  }

  async get(conditionId: string): Promise<Condition | undefined> {
    return this.repository.get(conditionId);
  }
}
