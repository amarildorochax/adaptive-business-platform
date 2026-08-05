import type { Action, ActionCategory } from './Action';
import { ActionService } from './ActionService';
import type { AuditRecord } from './AuditRecord';
import { AuditRecordService } from './AuditRecordService';
import type { Condition, ConditionKind } from './Condition';
import { ConditionService } from './ConditionService';
import type { ConditionExpression, ConditionOperator } from './ConditionExpression';
import { ConditionExpressionService } from './ConditionExpressionService';
import type { DeadLetterEntry } from './DeadLetterEntry';
import { DeadLetterEntryService } from './DeadLetterEntryService';
import type { Execution } from './Execution';
import { ExecutionService } from './ExecutionService';
import type { ExecutionHistoryRecord } from './ExecutionHistoryRecord';
import { ExecutionHistoryRecordService } from './ExecutionHistoryRecordService';
import type { ExecutionStep } from './ExecutionStep';
import { ExecutionStepService } from './ExecutionStepService';
import type { RetryAttempt } from './RetryAttempt';
import { RetryAttemptService } from './RetryAttemptService';
import type { RetryPolicy } from './RetryPolicy';
import { RetryPolicyService } from './RetryPolicyService';
import type { ScheduleDefinition, ScheduleKind } from './ScheduleDefinition';
import { ScheduleDefinitionService } from './ScheduleDefinitionService';
import type { Trigger, TriggerCategory } from './Trigger';
import { TriggerService } from './TriggerService';
import type { Workflow } from './Workflow';
import { WorkflowService } from './WorkflowService';
import type { WorkflowBranch } from './WorkflowBranch';
import { WorkflowBranchService } from './WorkflowBranchService';
import type { WorkflowValidationResult } from './WorkflowValidationResult';
import { WorkflowValidationService } from './WorkflowValidationService';
import { WorkflowVersionService } from './WorkflowVersionService';

export interface AutomationManagerDependencies {
  readonly workflows: WorkflowService;
  readonly workflowVersions: WorkflowVersionService;
  readonly workflowBranches: WorkflowBranchService;
  readonly workflowValidation: WorkflowValidationService;
  readonly triggers: TriggerService;
  readonly schedules: ScheduleDefinitionService;
  readonly conditions: ConditionService;
  readonly conditionExpressions: ConditionExpressionService;
  readonly actions: ActionService;
  readonly retryPolicies: RetryPolicyService;
  readonly executions: ExecutionService;
  readonly executionSteps: ExecutionStepService;
  readonly retryAttempts: RetryAttemptService;
  readonly executionHistory: ExecutionHistoryRecordService;
  readonly deadLetter: DeadLetterEntryService;
  readonly audit: AuditRecordService;
}

/**
 * Resultado de uma operação de AutomationManager — a Entidade produzida, e o Audit Record
 * consequente, quando a operação corresponde a uma das seis operações já catalogadas em
 * `AuditRecord.ts` (`AuditedOperation`). **Nunca tem um campo `command` nem um campo `events`** —
 * `AUTOMATION_ENGINE.md` nunca catalogou Commands para este Hub, e nunca catalogou um Event Map
 * próprio (Capítulo 15: "o mesmo Event Map já descrito em SYSTEM_BLUEPRINT.md" — não repetido, não
 * antecipado por esta Sprint). `AuditRecord` é o mecanismo que este Hub já expõe para o mesmo papel
 * que Command/Event cumprem nos sete Hubs anteriores — ver Nota de Posicionamento do relatório desta
 * Sprint.
 */
export interface AutomationOperationResult<TEntity> {
  readonly result: TEntity;
  readonly audit?: AuditRecord;
}

/**
 * AutomationManager — o componente "Automation Manager" já catalogado em
 * `AutomationOrchestrationComponent.ts`, implementado pela primeira vez nesta Sprint (IMP-009,
 * Automation Core). Nunca contém, ele mesmo, regra de negócio de uma Entidade específica — mesma
 * disciplina de fronteira já demonstrada por todo Manager anterior desta série.
 *
 * Escopo desta Sprint (Automation Core, per o Roadmap de curto prazo do próprio Blueprint, Capítulo
 * 20): "o Automation Manager, o Workflow Engine, o Trigger Manager e o Condition Engine operando de
 * ponta a ponta para o conjunto essencial de Triggers de Evento e de Tempo, com o Execution Engine
 * mantendo estado persistente e o Execution History registrando toda execução concluída" — nunca
 * Approval Engine, Automation Preview, Simulation Engine ou integração com Business Profile Engine,
 * todos explicitamente "médio prazo"; nunca Rollback Manager maduro, Composable Workflows maduro ou
 * refinamento de Automation Analytics, todos explicitamente "longo prazo" (ver relatório desta
 * Sprint).
 *
 * ACL: toda referência a outro Hub é sempre um identificador ou uma descrição opaca —
 * `Trigger.sourceDescription`, `Action.targetDescription` — nunca um tipo importado de
 * `@abp/crm-hub`, `@abp/communication-hub`, `@abp/content-hub`, `@abp/growth-hub`,
 * `@abp/commerce-hub`, `@abp/finance-hub` ou `@abp/analytics-hub` (Low Coupling, `AUTOMATION_ENGINE.md`,
 * Capítulo 5).
 */
export class AutomationManager {
  constructor(private readonly deps: AutomationManagerDependencies) {}

  async createWorkflow(
    tenantId: string,
    name: string,
    triggerId: string,
    actionIds: readonly string[],
    performedByIdentityId: string,
  ): Promise<AutomationOperationResult<Workflow>> {
    const workflow = await this.deps.workflows.create(tenantId, name, triggerId, actionIds);
    await this.deps.workflowVersions.recordVersion(workflow.workflowId, workflow.version);
    const audit = await this.deps.audit.record('WorkflowCreated', workflow.workflowId, performedByIdentityId);

    return { result: workflow, audit };
  }

  async editWorkflow(
    workflowId: string,
    performedByIdentityId: string,
    name?: string,
    actionIds?: readonly string[],
  ): Promise<AutomationOperationResult<Workflow>> {
    const workflow = await this.deps.workflows.edit(workflowId, name, actionIds);
    await this.deps.workflowVersions.recordVersion(workflow.workflowId, workflow.version);
    const audit = await this.deps.audit.record('WorkflowEdited', workflow.workflowId, performedByIdentityId);

    return { result: workflow, audit };
  }

  /** Verifica que o Workflow é internamente consistente antes de ativação — nunca decide, ele mesmo, se o Workflow deve ser ativado, apenas relata. */
  async validateWorkflow(workflowId: string): Promise<WorkflowValidationResult> {
    const workflow = await this.deps.workflows.get(workflowId);

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} não encontrado.`);
    }

    const branches = await this.deps.workflowBranches.list(workflowId);
    return this.deps.workflowValidation.validate(workflow, branches);
  }

  /** Nunca ativa um Workflow que falhou na validação (Workflow Validator, `AUTOMATION_ENGINE.md`, Capítulo 7). */
  async activateWorkflow(workflowId: string, performedByIdentityId: string): Promise<AutomationOperationResult<Workflow>> {
    const validation = await this.validateWorkflow(workflowId);

    if (!validation.valid) {
      throw new Error(`Workflow ${workflowId} não pode ser ativado — validação falhou (${JSON.stringify(validation)}).`);
    }

    const workflow = await this.deps.workflows.activate(workflowId);
    const audit = await this.deps.audit.record('WorkflowActivated', workflowId, performedByIdentityId);

    return { result: workflow, audit };
  }

  async deactivateWorkflow(workflowId: string, performedByIdentityId: string): Promise<AutomationOperationResult<Workflow>> {
    const workflow = await this.deps.workflows.deactivate(workflowId);
    const audit = await this.deps.audit.record('WorkflowDeactivated', workflowId, performedByIdentityId);

    return { result: workflow, audit };
  }

  /** Nenhuma operação de Trigger está catalogada em `AuditedOperation` — ver relatório desta Sprint. */
  async registerTrigger(tenantId: string, category: TriggerCategory, sourceDescription: string): Promise<AutomationOperationResult<Trigger>> {
    const trigger = await this.deps.triggers.register(tenantId, category, sourceDescription);
    return { result: trigger };
  }

  async defineSchedule(triggerId: string, kind: ScheduleKind, description: string): Promise<AutomationOperationResult<ScheduleDefinition>> {
    const trigger = await this.deps.triggers.get(triggerId);

    if (!trigger) {
      throw new Error(`Trigger ${triggerId} não encontrado.`);
    }

    const schedule = await this.deps.schedules.define(trigger, kind, description);
    return { result: schedule };
  }

  async defineCondition(kind: ConditionKind, description: string): Promise<AutomationOperationResult<Condition>> {
    const condition = await this.deps.conditions.define(kind, description);
    return { result: condition };
  }

  async combineConditions(operator: ConditionOperator, conditionIds: readonly string[]): Promise<AutomationOperationResult<ConditionExpression>> {
    const expression = await this.deps.conditionExpressions.combine(operator, conditionIds);
    return { result: expression };
  }

  async defineAction(
    category: ActionCategory,
    targetDescription: string,
    retryPolicyId?: string,
    timeoutSeconds?: number,
  ): Promise<AutomationOperationResult<Action>> {
    const action = await this.deps.actions.define(category, targetDescription, retryPolicyId, timeoutSeconds);
    return { result: action };
  }

  async defineRetryPolicy(maxAttempts: number, backoffDescription: string): Promise<AutomationOperationResult<RetryPolicy>> {
    const policy = await this.deps.retryPolicies.define(maxAttempts, backoffDescription);
    return { result: policy };
  }

  async addBranch(workflowId: string, conditionId: string, order: number, actionIds: readonly string[]): Promise<AutomationOperationResult<WorkflowBranch>> {
    const branch = await this.deps.workflowBranches.add(workflowId, conditionId, order, actionIds);
    return { result: branch };
  }

  /** Inicia uma Execution — exige um Workflow já `Active` (Event First, `AUTOMATION_ENGINE.md`, Capítulo 5). */
  async startExecution(workflowId: string, triggerId: string): Promise<AutomationOperationResult<Execution>> {
    const workflow = await this.deps.workflows.get(workflowId);

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} não encontrado.`);
    }

    if (workflow.status !== 'Active') {
      throw new Error(`Workflow ${workflowId} não está ativo — Execution exige um Workflow "Active".`);
    }

    const execution = await this.deps.executions.start(workflowId, triggerId);
    return { result: execution };
  }

  /**
   * Resolve, entre os Branches de um Workflow, o primeiro cuja Condition está satisfeita, avaliados
   * sempre na ordem em que foram definidos — `undefined` é um resultado válido e esperado quando
   * nenhum Branch se aplica, nunca uma falha (Um Branch Não É Bifurcação Paralela, `AUTOMATION_ENGINE.md`,
   * Capítulo 8).
   */
  async resolveBranch(workflowId: string, satisfiedConditionIds: ReadonlySet<string>): Promise<WorkflowBranch | undefined> {
    const branches = await this.deps.workflowBranches.list(workflowId);
    return branches.find((branch) => satisfiedConditionIds.has(branch.conditionId));
  }

  async startStep(executionId: string, actionId: string): Promise<AutomationOperationResult<ExecutionStep>> {
    const step = await this.deps.executionSteps.start(executionId, actionId);
    return { result: step };
  }

  async completeStep(executionStepId: string): Promise<AutomationOperationResult<ExecutionStep>> {
    const step = await this.deps.executionSteps.complete(executionStepId);
    return { result: step };
  }

  /**
   * Trata a falha transitória de uma etapa: registra a tentativa e, se a Retry Policy ainda permite
   * nova tentativa, a etapa permanece `Pending`; caso contrário, a etapa falha definitivamente e é
   * encaminhada à Dead Letter Queue (Retry by Design/ADR-011, `AUTOMATION_ENGINE.md`).
   */
  async handleStepFailure(
    executionStepId: string,
    retryPolicy: RetryPolicy,
    failureDescription: string,
  ): Promise<AutomationOperationResult<{ step: ExecutionStep; retryAttempt?: RetryAttempt; deadLetterEntry?: DeadLetterEntry }>> {
    const existing = await this.deps.executionSteps.get(executionStepId);

    if (!existing) {
      throw new Error(`Execution Step ${executionStepId} não encontrado.`);
    }

    if (existing.attemptCount < retryPolicy.maxAttempts) {
      const step = await this.deps.executionSteps.incrementAttempt(executionStepId);
      const retryAttempt = await this.deps.retryAttempts.record(executionStepId, step.attemptCount);

      return { result: { step, retryAttempt } };
    }

    const step = await this.deps.executionSteps.fail(executionStepId);
    const deadLetterEntry = await this.deps.deadLetter.receive(executionStepId, failureDescription);

    return { result: { step, deadLetterEntry } };
  }

  /** Registra a conclusão de uma Execution — `NoActionTaken` (nenhum Branch satisfeito) nunca é confundido com `Failure` (ADR-012). */
  async completeExecution(executionId: string, workflowId: string, outcome: ExecutionHistoryRecord['outcome']): Promise<AutomationOperationResult<{ execution: Execution; history: ExecutionHistoryRecord }>> {
    const execution = outcome === 'Failure' ? await this.deps.executions.fail(executionId) : await this.deps.executions.succeed(executionId);
    const history = await this.deps.executionHistory.record(executionId, workflowId, outcome);

    return { result: { execution, history } };
  }
}
