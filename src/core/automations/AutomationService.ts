import type { AutomationRule } from "./AutomationRule";
import type { AutomationTrigger } from "./AutomationTrigger";
import type { AutomationAction } from "./AutomationAction";
import type { AutomationExecution, AutomationExecutionStatus } from "./AutomationExecution";
import { AutomationStore } from "./AutomationStore";

/** Campos aceitos por `AutomationService.createRule()`. */
export type AutomationRuleInput = Pick<
  AutomationRule,
  "name" | "description" | "triggerId" | "actionIds" | "priority" | "metadata"
>;

/** Campos aceitos por `AutomationService.createTrigger()`. */
export type AutomationTriggerInput = Pick<AutomationTrigger, "eventType" | "conditions">;

/** Campos aceitos por `AutomationService.createAction()`. */
export type AutomationActionInput = Pick<AutomationAction, "type" | "target" | "parameters">;

/**
 * Cadastro, consulta, habilitação, desabilitação, avaliação lógica e
 * execução conceitual de AutomationRule (Tarefa 09) — mais dois métodos
 * além do CRUD de regra (`createTrigger`/`createAction`), necessários
 * para que AutomationTrigger/AutomationAction (Tarefas 05/06, exigidas
 * nos Critérios de Aceite) tenham algum caminho de escrita — mesmo
 * princípio já usado nas Sprints 10A/11 (`CRM.updateOpportunity()`,
 * `Campaign.defineAudience()`/`recordResult()`).
 *
 * **Nenhuma ação externa é realmente executada** (Tarefa 09): `execute()`
 * nunca interpreta `AutomationAction.type`/`target`/`parameters` para
 * produzir efeito algum — apenas registra, em `AutomationExecution.logs`,
 * o que aconteceria. Da mesma forma, `evaluate()` nunca interpreta o
 * conteúdo de `AutomationTrigger.conditions` — apenas confirma que a
 * regra está habilitada e que seu trigger e todas as suas actions
 * existem.
 *
 * Stateless em relação a eventos/métricas — isso é responsabilidade de
 * AutomationManager.
 *
 * Dependências: AutomationStore (própria instância).
 *
 * Consumido exclusivamente por AutomationManager.
 */
export class AutomationService {
  private readonly store = new AutomationStore();

  /** Cria uma nova AutomationRule — `enabled` inicia sempre em `false`. */
  createRule(input: AutomationRuleInput): AutomationRule {
    const now = new Date();

    const rule: AutomationRule = {
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      enabled: false,
      triggerId: input.triggerId,
      actionIds: input.actionIds,
      priority: input.priority,
      metadata: input.metadata,
      createdAt: now,
      updatedAt: now,
    };

    this.store.addRule(rule);

    return rule;
  }

  /** Atualiza os campos de `input` (parcial) na AutomationRule de `id`. Retorna `undefined` se não existir. */
  updateRule(id: string, input: Partial<AutomationRuleInput>): AutomationRule | undefined {
    const existing = this.store.getRule(id);

    if (!existing) {
      return undefined;
    }

    const updated: AutomationRule = { ...existing, ...input, updatedAt: new Date() };
    this.store.addRule(updated);

    return updated;
  }

  /** Remove a AutomationRule de `id`. Retorna `false` se não existir. */
  removeRule(id: string): boolean {
    return this.store.removeRule(id);
  }

  /** Retorna a AutomationRule de `id`, ou `undefined` se não existir. */
  getRule(id: string): AutomationRule | undefined {
    return this.store.getRule(id);
  }

  /** Retorna todas as AutomationRule já cadastradas. */
  listRules(): AutomationRule[] {
    return this.store.getAllRules();
  }

  /** Habilita a AutomationRule de `id`. Retorna `undefined` se não existir. */
  enableRule(id: string): AutomationRule | undefined {
    return this.setEnabled(id, true);
  }

  /** Desabilita a AutomationRule de `id`. Retorna `undefined` se não existir. */
  disableRule(id: string): AutomationRule | undefined {
    return this.setEnabled(id, false);
  }

  /** Cria um novo AutomationTrigger, reutilizável por múltiplas AutomationRule. */
  createTrigger(input: AutomationTriggerInput): AutomationTrigger {
    const trigger: AutomationTrigger = {
      id: crypto.randomUUID(),
      eventType: input.eventType,
      conditions: input.conditions,
      createdAt: new Date(),
    };

    this.store.addTrigger(trigger);

    return trigger;
  }

  /** Cria uma nova AutomationAction, reutilizável por múltiplas AutomationRule. */
  createAction(input: AutomationActionInput): AutomationAction {
    const action: AutomationAction = {
      id: crypto.randomUUID(),
      type: input.type,
      target: input.target,
      parameters: input.parameters,
      createdAt: new Date(),
    };

    this.store.addAction(action);

    return action;
  }

  /**
   * Avaliação lógica: a regra está apta a ser executada quando está
   * habilitada, seu trigger existe, e todas as suas actions existem.
   * Nunca interpreta `conditions`/`parameters`.
   */
  evaluate(ruleId: string): boolean {
    const rule = this.store.getRule(ruleId);

    if (!rule || !rule.enabled) {
      return false;
    }

    if (!this.store.getTrigger(rule.triggerId)) {
      return false;
    }

    return rule.actionIds.every((actionId) => this.store.getAction(actionId) !== undefined);
  }

  /**
   * Execução conceitual da AutomationRule de `ruleId` — registra uma
   * AutomationExecution descrevendo o que aconteceria, sem produzir
   * nenhum efeito real. Retorna `undefined` se a regra não existir.
   */
  execute(ruleId: string): AutomationExecution | undefined {
    const rule = this.store.getRule(ruleId);

    if (!rule) {
      return undefined;
    }

    const startedAt = new Date();
    const eligible = this.evaluate(ruleId);
    const logs: string[] = [];
    let status: AutomationExecutionStatus;

    if (!eligible) {
      status = "skipped";
      logs.push(`Regra "${rule.name}" não está apta para execução (desabilitada ou trigger/ações inexistentes).`);
    } else {
      status = "completed";
      logs.push(`Regra "${rule.name}" avaliada como apta.`);

      for (const actionId of rule.actionIds) {
        const action = this.store.getAction(actionId);
        logs.push(
          `Ação "${action?.type ?? actionId}" seria executada (execução conceitual — nenhuma ação real é disparada nesta Sprint).`,
        );
      }
    }

    const execution: AutomationExecution = {
      id: crypto.randomUUID(),
      ruleId,
      startedAt,
      finishedAt: new Date(),
      status,
      logs,
    };

    this.store.addExecution(execution);

    return execution;
  }

  /** Retorna o histórico de AutomationExecution da AutomationRule de `ruleId`. */
  listExecutions(ruleId: string): AutomationExecution[] {
    return this.store.getExecutions(ruleId);
  }

  private setEnabled(id: string, enabled: boolean): AutomationRule | undefined {
    const existing = this.store.getRule(id);

    if (!existing) {
      return undefined;
    }

    const updated: AutomationRule = { ...existing, enabled, updatedAt: new Date() };
    this.store.addRule(updated);

    return updated;
  }
}
