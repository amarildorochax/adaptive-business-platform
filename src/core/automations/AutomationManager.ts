import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import type { AutomationRule } from "./AutomationRule";
import type { AutomationTrigger } from "./AutomationTrigger";
import type { AutomationAction } from "./AutomationAction";
import type { AutomationExecution } from "./AutomationExecution";
import {
  AutomationService,
  type AutomationRuleInput,
  type AutomationTriggerInput,
  type AutomationActionInput,
} from "./AutomationService";
import { AutomationMetrics, type AutomationMetricsSnapshot } from "./AutomationMetrics";

/**
 * Coordena todas as operações de AutomationRule (Tarefa 03) — delega
 * cadastro/consulta/habilitação/desabilitação/avaliação/execução a
 * AutomationService, registra AutomationMetrics e emite os eventos de
 * ciclo de vida (AUTOMATION_RULE_CREATED/UPDATED/REMOVED/ENABLED/
 * DISABLED/EXECUTED).
 *
 * Nunca executa IA, Workflow, notificações, ou acessa nenhum outro
 * módulo internamente — apenas coordena AutomationService e a
 * infraestrutura cross-cutting (EventBus, AutomationMetrics). Não emite
 * evento para `createTrigger()`/`createAction()` — apenas os seis
 * eventos explicitamente pedidos pela Tarefa 11.
 *
 * Consumido exclusivamente por Automation (fachada).
 */
export class AutomationManager {
  private readonly service = new AutomationService();

  private readonly metrics = new AutomationMetrics();

  /** Cria uma nova AutomationRule (`enabled` inicia em `false`). */
  createRule(input: AutomationRuleInput): AutomationRule {
    const rule = this.service.createRule(input);
    this.metrics.recordMutation();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.AUTOMATION_RULE_CREATED,
      source: "AutomationManager",
      payload: { id: rule.id, enabled: rule.enabled },
      createdAt: rule.createdAt,
    });

    return rule;
  }

  /** Atualiza uma AutomationRule já existente (parcial). Retorna `undefined` se não existir. */
  updateRule(id: string, input: Partial<AutomationRuleInput>): AutomationRule | undefined {
    const updated = this.service.updateRule(id, input);

    if (updated) {
      this.metrics.recordMutation();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.AUTOMATION_RULE_UPDATED,
        source: "AutomationManager",
        payload: { id: updated.id },
        createdAt: updated.updatedAt,
      });
    }

    return updated;
  }

  /** Remove uma AutomationRule. Retorna `false` se não existir. */
  removeRule(id: string): boolean {
    const removed = this.service.removeRule(id);

    if (removed) {
      this.metrics.recordMutation();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.AUTOMATION_RULE_REMOVED,
        source: "AutomationManager",
        payload: { id },
        createdAt: new Date(),
      });
    }

    return removed;
  }

  /** Retorna a AutomationRule de `id`, ou `undefined` se não existir. Registra consulta. */
  getRule(id: string): AutomationRule | undefined {
    this.metrics.recordQuery();
    return this.service.getRule(id);
  }

  /** Retorna todas as AutomationRule cadastradas. Registra consulta. */
  listRules(): AutomationRule[] {
    this.metrics.recordQuery();
    return this.service.listRules();
  }

  /** Habilita uma AutomationRule. Retorna `undefined` se não existir. */
  enableRule(id: string): AutomationRule | undefined {
    const enabled = this.service.enableRule(id);

    if (enabled) {
      this.metrics.recordMutation();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.AUTOMATION_RULE_ENABLED,
        source: "AutomationManager",
        payload: { id: enabled.id },
        createdAt: enabled.updatedAt,
      });
    }

    return enabled;
  }

  /** Desabilita uma AutomationRule. Retorna `undefined` se não existir. */
  disableRule(id: string): AutomationRule | undefined {
    const disabled = this.service.disableRule(id);

    if (disabled) {
      this.metrics.recordMutation();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.AUTOMATION_RULE_DISABLED,
        source: "AutomationManager",
        payload: { id: disabled.id },
        createdAt: disabled.updatedAt,
      });
    }

    return disabled;
  }

  /** Executa (conceitualmente) uma AutomationRule. Retorna `undefined` se não existir. */
  executeRule(id: string): AutomationExecution | undefined {
    const execution = this.service.execute(id);

    if (execution) {
      this.metrics.recordExecution();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.AUTOMATION_RULE_EXECUTED,
        source: "AutomationManager",
        payload: { ruleId: execution.ruleId, status: execution.status },
        createdAt: execution.finishedAt,
      });
    }

    return execution;
  }

  /** Cria um novo AutomationTrigger. */
  createTrigger(input: AutomationTriggerInput): AutomationTrigger {
    return this.service.createTrigger(input);
  }

  /** Cria uma nova AutomationAction. */
  createAction(input: AutomationActionInput): AutomationAction {
    return this.service.createAction(input);
  }

  /** Retorna o histórico de AutomationExecution de uma AutomationRule. Registra consulta. */
  listExecutions(ruleId: string): AutomationExecution[] {
    this.metrics.recordQuery();
    return this.service.listExecutions(ruleId);
  }

  /** Métricas agregadas de uso do Automation Center. */
  getMetrics(): AutomationMetricsSnapshot {
    const rules = this.service.listRules();

    return this.metrics.snapshot({
      rules: rules.length,
      enabledRules: rules.filter((rule) => rule.enabled).length,
      disabledRules: rules.filter((rule) => !rule.enabled).length,
    });
  }
}
