import { describe, expect, it } from 'vitest';
import type { Workflow } from './Workflow';
import type { WorkflowBranch } from './WorkflowBranch';
import { WorkflowValidationService } from './WorkflowValidationService';
import { FakeActionRepository, FakeTriggerRepository, FakeWorkflowValidationResultRepository } from './testing/InMemoryFakes';

function workflow(triggerId: string, actionIds: string[]): Workflow {
  return {
    workflowId: 'workflow-1',
    tenantId: 'tenant-1',
    name: 'Workflow',
    status: 'Draft',
    version: 1,
    triggerId,
    actionIds,
    createdAt: new Date(),
  };
}

describe('WorkflowValidationService — porta a lógica de elegibilidade do Automation Center legado', () => {
  it('é inválido quando o Trigger referenciado não existe', async () => {
    const service = new WorkflowValidationService(
      new FakeWorkflowValidationResultRepository(),
      new FakeTriggerRepository(),
      new FakeActionRepository(),
    );

    const result = await service.validate(workflow('trigger-inexistente', []), []);

    expect(result.valid).toBe(false);
  });

  it('é inválido quando alguma Action referenciada não existe', async () => {
    const triggers = new FakeTriggerRepository();
    await triggers.create({ triggerId: 'trigger-1', tenantId: 'tenant-1', category: 'Event', sourceDescription: 'LeadCreated', registeredAt: new Date() });
    const service = new WorkflowValidationService(new FakeWorkflowValidationResultRepository(), triggers, new FakeActionRepository());

    const result = await service.validate(workflow('trigger-1', ['action-inexistente']), []);

    expect(result.actionsResolved).toBe(false);
    expect(result.valid).toBe(false);
  });

  it('é válido quando Trigger e todas as Action existem, sem Branch', async () => {
    const triggers = new FakeTriggerRepository();
    await triggers.create({ triggerId: 'trigger-1', tenantId: 'tenant-1', category: 'Event', sourceDescription: 'LeadCreated', registeredAt: new Date() });
    const actions = new FakeActionRepository();
    await actions.create({ actionId: 'action-1', category: 'SendMessage', targetDescription: 'Communication Hub' });
    const service = new WorkflowValidationService(new FakeWorkflowValidationResultRepository(), triggers, actions);

    const result = await service.validate(workflow('trigger-1', ['action-1']), []);

    expect(result.valid).toBe(true);
    expect(result.noCyclicComposition).toBe(true);
  });

  it('resolve Action referenciada por um Branch, não apenas pelo Workflow', async () => {
    const triggers = new FakeTriggerRepository();
    await triggers.create({ triggerId: 'trigger-1', tenantId: 'tenant-1', category: 'Event', sourceDescription: 'LeadCreated', registeredAt: new Date() });
    const actions = new FakeActionRepository();
    const service = new WorkflowValidationService(new FakeWorkflowValidationResultRepository(), triggers, actions);
    const branch: WorkflowBranch = { workflowBranchId: 'branch-1', workflowId: 'workflow-1', conditionId: 'condition-1', order: 0, actionIds: ['action-branch'] };

    const result = await service.validate(workflow('trigger-1', []), [branch]);

    expect(result.actionsResolved).toBe(false);
  });
});
