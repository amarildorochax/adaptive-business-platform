import type { Action } from '../Action';
import type { ActionRepository } from '../ActionRepository';
import type { AuditRecord } from '../AuditRecord';
import type { AuditRecordRepository } from '../AuditRecordRepository';
import type { Condition } from '../Condition';
import type { ConditionExpression } from '../ConditionExpression';
import type { ConditionExpressionRepository } from '../ConditionExpressionRepository';
import type { ConditionRepository } from '../ConditionRepository';
import type { DeadLetterEntry } from '../DeadLetterEntry';
import type { DeadLetterEntryRepository } from '../DeadLetterEntryRepository';
import type { Execution } from '../Execution';
import type { ExecutionHistoryRecord } from '../ExecutionHistoryRecord';
import type { ExecutionHistoryRecordRepository } from '../ExecutionHistoryRecordRepository';
import type { ExecutionRepository } from '../ExecutionRepository';
import type { ExecutionStep } from '../ExecutionStep';
import type { ExecutionStepRepository } from '../ExecutionStepRepository';
import type { RetryAttempt } from '../RetryAttempt';
import type { RetryAttemptRepository } from '../RetryAttemptRepository';
import type { RetryPolicy } from '../RetryPolicy';
import type { RetryPolicyRepository } from '../RetryPolicyRepository';
import type { ScheduleDefinition } from '../ScheduleDefinition';
import type { ScheduleDefinitionRepository } from '../ScheduleDefinitionRepository';
import type { Trigger } from '../Trigger';
import type { TriggerRepository } from '../TriggerRepository';
import type { Workflow } from '../Workflow';
import type { WorkflowBranch } from '../WorkflowBranch';
import type { WorkflowBranchRepository } from '../WorkflowBranchRepository';
import type { WorkflowRepository } from '../WorkflowRepository';
import type { WorkflowValidationResult } from '../WorkflowValidationResult';
import type { WorkflowValidationResultRepository } from '../WorkflowValidationResultRepository';
import type { WorkflowVersion } from '../WorkflowVersion';
import type { WorkflowVersionRepository } from '../WorkflowVersionRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-009, Etapa de Testes). Mesmo padrão já usado
 * pelos sete Hubs anteriores desta série — nunca exportados pelo barrel do pacote, nunca
 * referenciados por nenhum Service em produção.
 */

export class FakeWorkflowRepository implements WorkflowRepository {
  private readonly rows = new Map<string, Workflow>();
  async create(workflow: Workflow) {
    this.rows.set(workflow.workflowId, workflow);
    return workflow;
  }
  async update(workflow: Workflow) {
    this.rows.set(workflow.workflowId, workflow);
    return workflow;
  }
  async get(workflowId: string) {
    return this.rows.get(workflowId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((w) => w.tenantId === tenantId);
  }
}

export class FakeWorkflowVersionRepository implements WorkflowVersionRepository {
  private readonly rows: WorkflowVersion[] = [];
  async create(version: WorkflowVersion) {
    this.rows.push(version);
    return version;
  }
  async update(version: WorkflowVersion) {
    const index = this.rows.findIndex((v) => v.workflowId === version.workflowId && v.version === version.version);
    if (index >= 0) this.rows[index] = version;
    return version;
  }
  async list(workflowId: string) {
    return this.rows.filter((v) => v.workflowId === workflowId);
  }
}

export class FakeWorkflowBranchRepository implements WorkflowBranchRepository {
  private readonly rows: WorkflowBranch[] = [];
  async create(branch: WorkflowBranch) {
    this.rows.push(branch);
    return branch;
  }
  async list(workflowId: string) {
    return this.rows.filter((b) => b.workflowId === workflowId);
  }
}

export class FakeWorkflowValidationResultRepository implements WorkflowValidationResultRepository {
  private readonly rows = new Map<string, WorkflowValidationResult>();
  async save(result: WorkflowValidationResult) {
    this.rows.set(result.workflowId, result);
    return result;
  }
  async get(workflowId: string) {
    return this.rows.get(workflowId);
  }
}

export class FakeTriggerRepository implements TriggerRepository {
  private readonly rows = new Map<string, Trigger>();
  async create(trigger: Trigger) {
    this.rows.set(trigger.triggerId, trigger);
    return trigger;
  }
  async get(triggerId: string) {
    return this.rows.get(triggerId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((t) => t.tenantId === tenantId);
  }
}

export class FakeScheduleDefinitionRepository implements ScheduleDefinitionRepository {
  private readonly rows: ScheduleDefinition[] = [];
  async create(schedule: ScheduleDefinition) {
    this.rows.push(schedule);
    return schedule;
  }
  async findByTrigger(triggerId: string) {
    return this.rows.find((s) => s.triggerId === triggerId);
  }
}

export class FakeConditionRepository implements ConditionRepository {
  private readonly rows = new Map<string, Condition>();
  async create(condition: Condition) {
    this.rows.set(condition.conditionId, condition);
    return condition;
  }
  async get(conditionId: string) {
    return this.rows.get(conditionId);
  }
}

export class FakeConditionExpressionRepository implements ConditionExpressionRepository {
  private readonly rows = new Map<string, ConditionExpression>();
  async create(expression: ConditionExpression) {
    this.rows.set(expression.conditionExpressionId, expression);
    return expression;
  }
  async get(conditionExpressionId: string) {
    return this.rows.get(conditionExpressionId);
  }
}

export class FakeActionRepository implements ActionRepository {
  private readonly rows = new Map<string, Action>();
  async create(action: Action) {
    this.rows.set(action.actionId, action);
    return action;
  }
  async get(actionId: string) {
    return this.rows.get(actionId);
  }
}

export class FakeRetryPolicyRepository implements RetryPolicyRepository {
  private readonly rows = new Map<string, RetryPolicy>();
  async create(policy: RetryPolicy) {
    this.rows.set(policy.retryPolicyId, policy);
    return policy;
  }
  async get(retryPolicyId: string) {
    return this.rows.get(retryPolicyId);
  }
}

export class FakeExecutionRepository implements ExecutionRepository {
  private readonly rows = new Map<string, Execution>();
  async create(execution: Execution) {
    this.rows.set(execution.executionId, execution);
    return execution;
  }
  async update(execution: Execution) {
    this.rows.set(execution.executionId, execution);
    return execution;
  }
  async get(executionId: string) {
    return this.rows.get(executionId);
  }
  async list(workflowId: string) {
    return [...this.rows.values()].filter((e) => e.workflowId === workflowId);
  }
}

export class FakeExecutionStepRepository implements ExecutionStepRepository {
  private readonly rows = new Map<string, ExecutionStep>();
  async create(step: ExecutionStep) {
    this.rows.set(step.executionStepId, step);
    return step;
  }
  async update(step: ExecutionStep) {
    this.rows.set(step.executionStepId, step);
    return step;
  }
  async get(executionStepId: string) {
    return this.rows.get(executionStepId);
  }
  async list(executionId: string) {
    return [...this.rows.values()].filter((s) => s.executionId === executionId);
  }
}

export class FakeRetryAttemptRepository implements RetryAttemptRepository {
  private readonly rows: RetryAttempt[] = [];
  async create(attempt: RetryAttempt) {
    this.rows.push(attempt);
    return attempt;
  }
  async list(executionStepId: string) {
    return this.rows.filter((a) => a.executionStepId === executionStepId);
  }
}

export class FakeExecutionHistoryRecordRepository implements ExecutionHistoryRecordRepository {
  private readonly rows: ExecutionHistoryRecord[] = [];
  async create(record: ExecutionHistoryRecord) {
    this.rows.push(record);
    return record;
  }
  async list(workflowId: string) {
    return this.rows.filter((r) => r.workflowId === workflowId);
  }
}

export class FakeDeadLetterEntryRepository implements DeadLetterEntryRepository {
  private readonly rows: DeadLetterEntry[] = [];
  async create(entry: DeadLetterEntry) {
    this.rows.push(entry);
    return entry;
  }
  async list() {
    return [...this.rows];
  }
}

export class FakeAuditRecordRepository implements AuditRecordRepository {
  private readonly rows: AuditRecord[] = [];
  async create(record: AuditRecord) {
    this.rows.push(record);
    return record;
  }
  async list(subjectId: string) {
    return this.rows.filter((r) => r.subjectId === subjectId);
  }
}
