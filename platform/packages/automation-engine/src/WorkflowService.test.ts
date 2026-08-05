import { describe, expect, it } from 'vitest';
import { WorkflowService } from './WorkflowService';
import { FakeWorkflowRepository } from './testing/InMemoryFakes';

describe('WorkflowService', () => {
  it('cria um Workflow sempre no estado Draft, versão 1', async () => {
    const service = new WorkflowService(new FakeWorkflowRepository());

    const workflow = await service.create('tenant-1', 'Boas-vindas a novo Lead', 'trigger-1', ['action-1']);

    expect(workflow.status).toBe('Draft');
    expect(workflow.version).toBe(1);
  });

  it('edit incrementa a versão a cada alteração', async () => {
    const service = new WorkflowService(new FakeWorkflowRepository());
    const created = await service.create('tenant-1', 'Workflow', 'trigger-1', ['action-1']);

    const edited = await service.edit(created.workflowId, 'Workflow Renomeado');

    expect(edited.version).toBe(2);
    expect(edited.name).toBe('Workflow Renomeado');
  });

  it('percorre o ciclo de vida Draft → Active → Inactive', async () => {
    const service = new WorkflowService(new FakeWorkflowRepository());
    const created = await service.create('tenant-1', 'Workflow', 'trigger-1', ['action-1']);

    const activated = await service.activate(created.workflowId);
    expect(activated.status).toBe('Active');

    const deactivated = await service.deactivate(created.workflowId);
    expect(deactivated.status).toBe('Inactive');
  });
});
