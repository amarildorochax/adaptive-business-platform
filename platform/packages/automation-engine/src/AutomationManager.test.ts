import { describe, expect, it } from 'vitest';
import { ActionService } from './ActionService';
import { AuditRecordService } from './AuditRecordService';
import { AutomationManager } from './AutomationManager';
import { ConditionExpressionService } from './ConditionExpressionService';
import { ConditionService } from './ConditionService';
import { DeadLetterEntryService } from './DeadLetterEntryService';
import { ExecutionHistoryRecordService } from './ExecutionHistoryRecordService';
import { ExecutionService } from './ExecutionService';
import { ExecutionStepService } from './ExecutionStepService';
import { RetryAttemptService } from './RetryAttemptService';
import { RetryPolicyService } from './RetryPolicyService';
import { ScheduleDefinitionService } from './ScheduleDefinitionService';
import { TriggerService } from './TriggerService';
import { WorkflowBranchService } from './WorkflowBranchService';
import { WorkflowService } from './WorkflowService';
import { WorkflowValidationService } from './WorkflowValidationService';
import { WorkflowVersionService } from './WorkflowVersionService';
import {
  FakeActionRepository,
  FakeAuditRecordRepository,
  FakeConditionExpressionRepository,
  FakeConditionRepository,
  FakeDeadLetterEntryRepository,
  FakeExecutionHistoryRecordRepository,
  FakeExecutionRepository,
  FakeExecutionStepRepository,
  FakeRetryAttemptRepository,
  FakeRetryPolicyRepository,
  FakeScheduleDefinitionRepository,
  FakeTriggerRepository,
  FakeWorkflowBranchRepository,
  FakeWorkflowRepository,
  FakeWorkflowValidationResultRepository,
  FakeWorkflowVersionRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  const triggerRepository = new FakeTriggerRepository();
  const actionRepository = new FakeActionRepository();

  return new AutomationManager({
    workflows: new WorkflowService(new FakeWorkflowRepository()),
    workflowVersions: new WorkflowVersionService(new FakeWorkflowVersionRepository()),
    workflowBranches: new WorkflowBranchService(new FakeWorkflowBranchRepository()),
    workflowValidation: new WorkflowValidationService(new FakeWorkflowValidationResultRepository(), triggerRepository, actionRepository),
    triggers: new TriggerService(triggerRepository),
    schedules: new ScheduleDefinitionService(new FakeScheduleDefinitionRepository()),
    conditions: new ConditionService(new FakeConditionRepository()),
    conditionExpressions: new ConditionExpressionService(new FakeConditionExpressionRepository()),
    actions: new ActionService(actionRepository),
    retryPolicies: new RetryPolicyService(new FakeRetryPolicyRepository()),
    executions: new ExecutionService(new FakeExecutionRepository()),
    executionSteps: new ExecutionStepService(new FakeExecutionStepRepository()),
    retryAttempts: new RetryAttemptService(new FakeRetryAttemptRepository()),
    executionHistory: new ExecutionHistoryRecordService(new FakeExecutionHistoryRecordRepository()),
    deadLetter: new DeadLetterEntryService(new FakeDeadLetterEntryRepository()),
    audit: new AuditRecordService(new FakeAuditRecordRepository()),
  });
}

describe('AutomationManager — Automation Core', () => {
  it('createWorkflow produz um Audit Record "WorkflowCreated" — nenhum Command/Event catalogado existe para este Hub', async () => {
    const manager = buildManager();
    const trigger = await manager.registerTrigger('tenant-1', 'Event', 'LeadCreated');
    const action = await manager.defineAction('SendMessage', 'Communication Hub');

    const operation = await manager.createWorkflow('tenant-1', 'Boas-vindas', trigger.result.triggerId, [action.result.actionId], 'identity-1');

    expect(operation.result.status).toBe('Draft');
    expect(operation.audit?.operation).toBe('WorkflowCreated');
    expect('command' in operation).toBe(false);
    expect('events' in operation).toBe(false);
  });

  it('activateWorkflow exige validação bem-sucedida — nunca ativa um Workflow com Trigger ou Action inexistente', async () => {
    const manager = buildManager();
    const created = await manager.createWorkflow('tenant-1', 'Workflow', 'trigger-inexistente', [], 'identity-1');

    await expect(manager.activateWorkflow(created.result.workflowId, 'identity-1')).rejects.toThrow();
  });

  it('ciclo completo: createWorkflow → activateWorkflow → deactivateWorkflow, cada um com seu Audit Record', async () => {
    const manager = buildManager();
    const trigger = await manager.registerTrigger('tenant-1', 'Event', 'LeadCreated');
    const action = await manager.defineAction('SendMessage', 'Communication Hub');
    const created = await manager.createWorkflow('tenant-1', 'Workflow', trigger.result.triggerId, [action.result.actionId], 'identity-1');

    const activated = await manager.activateWorkflow(created.result.workflowId, 'identity-1');
    expect(activated.result.status).toBe('Active');
    expect(activated.audit?.operation).toBe('WorkflowActivated');

    const deactivated = await manager.deactivateWorkflow(created.result.workflowId, 'identity-1');
    expect(deactivated.result.status).toBe('Inactive');
    expect(deactivated.audit?.operation).toBe('WorkflowDeactivated');
  });

  it('startExecution exige um Workflow Active', async () => {
    const manager = buildManager();
    const trigger = await manager.registerTrigger('tenant-1', 'Event', 'LeadCreated');
    const action = await manager.defineAction('SendMessage', 'Communication Hub');
    const created = await manager.createWorkflow('tenant-1', 'Workflow', trigger.result.triggerId, [action.result.actionId], 'identity-1');

    await expect(manager.startExecution(created.result.workflowId, trigger.result.triggerId)).rejects.toThrow();

    await manager.activateWorkflow(created.result.workflowId, 'identity-1');
    const execution = await manager.startExecution(created.result.workflowId, trigger.result.triggerId);
    expect(execution.result.status).toBe('Running');
  });

  it('resolveBranch retorna o primeiro Branch cuja Condition está satisfeita, na ordem definida — undefined é um resultado válido, nunca uma falha (ADR-012)', async () => {
    const manager = buildManager();
    await manager.addBranch('workflow-1', 'condition-a', 1, ['action-a']);
    await manager.addBranch('workflow-1', 'condition-b', 0, ['action-b']);

    const resolved = await manager.resolveBranch('workflow-1', new Set(['condition-a', 'condition-b']));
    expect(resolved?.conditionId).toBe('condition-b');

    const unresolved = await manager.resolveBranch('workflow-1', new Set(['condition-nunca-satisfeita']));
    expect(unresolved).toBeUndefined();
  });

  it('handleStepFailure registra RetryAttempt enquanto a Retry Policy permite, e encaminha à Dead Letter Queue ao esgotar (ADR-007/ADR-011)', async () => {
    const manager = buildManager();
    const policy = await manager.defineRetryPolicy(2, 'espera progressiva');
    const step = await manager.startStep('execution-1', 'action-1');

    const first = await manager.handleStepFailure(step.result.executionStepId, policy.result, 'timeout transitório');
    expect(first.result.step.status).toBe('Pending');
    expect(first.result.retryAttempt).toBeDefined();
    expect(first.result.deadLetterEntry).toBeUndefined();

    const second = await manager.handleStepFailure(step.result.executionStepId, policy.result, 'timeout transitório');
    expect(second.result.step.status).toBe('Pending');

    const third = await manager.handleStepFailure(step.result.executionStepId, policy.result, 'timeout definitivo');
    expect(third.result.step.status).toBe('Failed');
    expect(third.result.deadLetterEntry).toBeDefined();
  });

  it('completeExecution distingue Success de NoActionTaken — nenhum Branch satisfeito nunca é registrado como Failure (ADR-012)', async () => {
    const manager = buildManager();
    const trigger = await manager.registerTrigger('tenant-1', 'Event', 'LeadCreated');
    const created = await manager.createWorkflow('tenant-1', 'Workflow', trigger.result.triggerId, [], 'identity-1');
    await manager.activateWorkflow(created.result.workflowId, 'identity-1');
    const execution = await manager.startExecution(created.result.workflowId, trigger.result.triggerId);

    const outcome = await manager.completeExecution(execution.result.executionId, created.result.workflowId, 'NoActionTaken');

    expect(outcome.result.execution.status).toBe('Succeeded');
    expect(outcome.result.history.outcome).toBe('NoActionTaken');
  });

  it('completeExecution registra Failed quando o outcome é Failure', async () => {
    const manager = buildManager();
    const trigger = await manager.registerTrigger('tenant-1', 'Event', 'LeadCreated');
    const created = await manager.createWorkflow('tenant-1', 'Workflow', trigger.result.triggerId, [], 'identity-1');
    await manager.activateWorkflow(created.result.workflowId, 'identity-1');
    const execution = await manager.startExecution(created.result.workflowId, trigger.result.triggerId);

    const outcome = await manager.completeExecution(execution.result.executionId, created.result.workflowId, 'Failure');

    expect(outcome.result.execution.status).toBe('Failed');
  });
});
