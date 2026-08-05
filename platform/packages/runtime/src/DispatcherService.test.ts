import { describe, expect, it } from 'vitest';
import { DispatcherService } from './DispatcherService';
import { FakeDispatchResultRepository, FakeDispatchTargetRepository } from './testing/InMemoryFakes';

describe('DispatcherService — "encaminha... sem decidir, ele mesmo, qual Workflow, qual Regra, ou qual resposta é apropriada"', () => {
  it('registerTarget cria um Dispatch Target opaco por categoria', async () => {
    const service = new DispatcherService(new FakeDispatchTargetRepository(), new FakeDispatchResultRepository());

    const target = await service.registerTarget('AutomationEngine', 'workflow-engine');

    expect(target.kind).toBe('AutomationEngine');
    expect(target.targetDescription).toBe('workflow-engine');
  });

  it('dispatch registra o fato do encaminhamento, nunca o resultado do processamento em si', async () => {
    const service = new DispatcherService(new FakeDispatchTargetRepository(), new FakeDispatchResultRepository());
    const target = await service.registerTarget('BusinessHub', 'finance-hub');

    const result = await service.dispatch('ctx-1', target.dispatchTargetId, true);

    expect(result.succeeded).toBe(true);
    expect(result.executionContextId).toBe('ctx-1');
  });

  it('listResults retorna apenas os encaminhamentos do Execution Context pedido', async () => {
    const service = new DispatcherService(new FakeDispatchTargetRepository(), new FakeDispatchResultRepository());
    const target = await service.registerTarget('AIHub', 'ai-hub-contract');
    await service.dispatch('ctx-1', target.dispatchTargetId, false);
    await service.dispatch('ctx-2', target.dispatchTargetId, true);

    const results = await service.listResults('ctx-1');

    expect(results).toHaveLength(1);
    expect(results[0]?.succeeded).toBe(false);
  });
});
