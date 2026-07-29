import type { AutomationRule } from "./AutomationRule";
import type { AutomationTrigger } from "./AutomationTrigger";
import type { AutomationAction } from "./AutomationAction";
import type { AutomationExecution } from "./AutomationExecution";

/**
 * Armazenamento de AutomationRule/AutomationTrigger/AutomationAction/
 * AutomationExecution — exclusivamente em memória (`Map`), sem
 * persistência (Tarefa 08). Único Store desta Sprint — guarda as
 * quatro entidades do domínio, cada uma em seu próprio `Map`.
 *
 * `executions` é histórico (array por `ruleId`) — uma AutomationRule
 * pode acumular várias AutomationExecution ao longo do tempo.
 *
 * Responsabilidade: guardar e recuperar por identificador — nenhuma
 * regra de negócio/avaliação (isso é responsabilidade de
 * AutomationService) e nenhuma emissão de evento (isso é
 * responsabilidade de AutomationManager).
 *
 * Consumido exclusivamente por AutomationService.
 */
export class AutomationStore {
  private rules = new Map<string, AutomationRule>();

  private triggers = new Map<string, AutomationTrigger>();

  private actions = new Map<string, AutomationAction>();

  private executions = new Map<string, AutomationExecution[]>();

  /** Adiciona (ou substitui, se já existir o mesmo `id`) uma AutomationRule. */
  addRule(rule: AutomationRule): void {
    this.rules.set(rule.id, rule);
  }

  /** Retorna a AutomationRule de `id`, ou `undefined` se não existir. */
  getRule(id: string): AutomationRule | undefined {
    return this.rules.get(id);
  }

  /** Retorna todas as AutomationRule já cadastradas. */
  getAllRules(): AutomationRule[] {
    return Array.from(this.rules.values());
  }

  /** Remove a AutomationRule de `id`. Retorna `false` se não existir. */
  removeRule(id: string): boolean {
    return this.rules.delete(id);
  }

  /** Adiciona um novo AutomationTrigger. */
  addTrigger(trigger: AutomationTrigger): void {
    this.triggers.set(trigger.id, trigger);
  }

  /** Retorna o AutomationTrigger de `id`, ou `undefined` se não existir. */
  getTrigger(id: string): AutomationTrigger | undefined {
    return this.triggers.get(id);
  }

  /** Adiciona uma nova AutomationAction. */
  addAction(action: AutomationAction): void {
    this.actions.set(action.id, action);
  }

  /** Retorna a AutomationAction de `id`, ou `undefined` se não existir. */
  getAction(id: string): AutomationAction | undefined {
    return this.actions.get(id);
  }

  /** Acrescenta uma AutomationExecution ao histórico de `execution.ruleId`. */
  addExecution(execution: AutomationExecution): void {
    const existing = this.executions.get(execution.ruleId) ?? [];
    existing.push(execution);
    this.executions.set(execution.ruleId, existing);
  }

  /** Retorna o histórico de AutomationExecution de `ruleId` (vazio se nenhuma foi registrada). */
  getExecutions(ruleId: string): AutomationExecution[] {
    return this.executions.get(ruleId) ?? [];
  }

  /** Remove todos os dados armazenados (as quatro entidades). */
  clear(): void {
    this.rules.clear();
    this.triggers.clear();
    this.actions.clear();
    this.executions.clear();
  }
}
