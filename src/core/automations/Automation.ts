import type { AutomationRule } from "./AutomationRule";
import type { AutomationTrigger } from "./AutomationTrigger";
import type { AutomationAction } from "./AutomationAction";
import type { AutomationExecution } from "./AutomationExecution";
import { AutomationManager } from "./AutomationManager";
import type { AutomationRuleInput, AutomationTriggerInput, AutomationActionInput } from "./AutomationService";
import type { AutomationMetricsSnapshot } from "./AutomationMetrics";

/**
 * Fachada pública única do Automation Center (Tarefa 02).
 *
 * ```
 * Application
 *    ↓
 * Automation.createRule/updateRule/removeRule/getRule/listRules/
 *            enableRule/disableRule/executeRule/getMetrics   ← única fachada
 *            (+ createTrigger/createAction/listExecutions, além do mínimo)
 *    ↓
 * AutomationManager   ← coordena; nunca executa IA/Workflow/notificações;
 *                        nunca acessa outro módulo internamente
 *    ↓
 * AutomationService     ← cadastro, consulta, avaliação lógica, execução conceitual
 *    ↓
 * AutomationStore
 *    ↓
 * AutomationRule · AutomationTrigger · AutomationAction · AutomationExecution
 * ```
 *
 * Evento → Regra → Ação: uma AutomationRule liga um AutomationTrigger
 * (`eventType`/`conditions`) a uma ou mais AutomationAction
 * (`type`/`target`/`parameters`). `executeRule()` é sempre **conceitual**
 * — nunca dispara nenhuma IA, Workflow, notificação, scheduler ou
 * integração externa; apenas registra, em `AutomationExecution.logs`, o
 * que aconteceria.
 *
 * Nota de projeto: `src/core/automation/` (singular) já existia desde a
 * Sprint 0A — stubs `IAutomation` legados (WorkflowEngine/RuleEngine/
 * TriggerManager/HookManager/PolicyManager), nunca implementados, sem
 * nenhum consumidor real. Para não colidir nem se misturar com esse
 * diretório pré-existente, este módulo vive em `src/core/automations/`
 * (plural) — decisão confirmada com o usuário, mesmo princípio já
 * aplicado à colisão `WorkflowEngine` na Sprint "Workflow Engine"
 * (`src/core/workflow/`, também no singular-vs-plural). `src/core/
 * automation/` permanece 100% intocado por esta Sprint.
 *
 * Este módulo não consome nenhum outro domínio da plataforma (CRM,
 * Campaign, Marketing, Finance, Workflow Engine, Agent Catalog, etc.) —
 * nenhum deles é importado aqui, direta ou indiretamente. Qualquer
 * comunicação futura com esses módulos deve ocorrer via EventBus, nunca
 * por acoplamento direto (ver REGRAS do prompt).
 *
 * Responsabilidade: nenhum consumidor deve importar AutomationManager,
 * AutomationService ou AutomationStore diretamente — todos usam
 * exclusivamente esta fachada.
 *
 * Dependências: AutomationManager.
 */
export class Automation {
  private readonly manager = new AutomationManager();

  /** Cria uma nova AutomationRule (`enabled` inicia em `false`). */
  createRule(input: AutomationRuleInput): AutomationRule {
    return this.manager.createRule(input);
  }

  /** Atualiza uma AutomationRule já existente (parcial). */
  updateRule(id: string, input: Partial<AutomationRuleInput>): AutomationRule | undefined {
    return this.manager.updateRule(id, input);
  }

  /** Remove uma AutomationRule. Retorna `false` se não existir. */
  removeRule(id: string): boolean {
    return this.manager.removeRule(id);
  }

  /** Recupera uma AutomationRule por `id`, ou `undefined` se não existir. */
  getRule(id: string): AutomationRule | undefined {
    return this.manager.getRule(id);
  }

  /** Retorna todas as AutomationRule cadastradas. */
  listRules(): AutomationRule[] {
    return this.manager.listRules();
  }

  /** Habilita uma AutomationRule. */
  enableRule(id: string): AutomationRule | undefined {
    return this.manager.enableRule(id);
  }

  /** Desabilita uma AutomationRule. */
  disableRule(id: string): AutomationRule | undefined {
    return this.manager.disableRule(id);
  }

  /** Executa (conceitualmente) uma AutomationRule. */
  executeRule(id: string): AutomationExecution | undefined {
    return this.manager.executeRule(id);
  }

  /** Cria um novo AutomationTrigger, reutilizável por múltiplas AutomationRule. */
  createTrigger(input: AutomationTriggerInput): AutomationTrigger {
    return this.manager.createTrigger(input);
  }

  /** Cria uma nova AutomationAction, reutilizável por múltiplas AutomationRule. */
  createAction(input: AutomationActionInput): AutomationAction {
    return this.manager.createAction(input);
  }

  /** Retorna o histórico de AutomationExecution de uma AutomationRule. */
  listExecutions(ruleId: string): AutomationExecution[] {
    return this.manager.listExecutions(ruleId);
  }

  /** Métricas agregadas de uso do Automation Center. */
  getMetrics(): AutomationMetricsSnapshot {
    return this.manager.getMetrics();
  }
}

/** Instância única e compartilhada do Automation para toda a plataforma. */
export const automation = new Automation();
