import { describe, expect, it } from 'vitest';
import { ExecutionLifecycleService } from './ExecutionLifecycleService';
import { FakeExecutionLifecycleStateRepository } from './testing/InMemoryFakes';

describe('ExecutionLifecycleService — "Received → Context Established → Dispatched → Running → Completed | Failed"', () => {
  it('start registra Received; advance percorre a sequência literal do Blueprint', async () => {
    const service = new ExecutionLifecycleService(new FakeExecutionLifecycleStateRepository());

    await service.start('ctx-1');
    await service.advance('ctx-1', 'ContextEstablished');
    await service.advance('ctx-1', 'Dispatched');
    await service.advance('ctx-1', 'Running');
    const completed = await service.advance('ctx-1', 'Completed');

    expect(completed.stage).toBe('Completed');
    expect(await service.currentStage('ctx-1')).toBe('Completed');
  });

  it('nunca permite pular um estágio — Received direto para Dispatched falha', async () => {
    const service = new ExecutionLifecycleService(new FakeExecutionLifecycleStateRepository());
    await service.start('ctx-1');

    await expect(service.advance('ctx-1', 'Dispatched')).rejects.toThrow();
  });

  it('Completed e Failed são terminais — nenhuma transição parte deles', async () => {
    const service = new ExecutionLifecycleService(new FakeExecutionLifecycleStateRepository());
    await service.start('ctx-1');
    await service.advance('ctx-1', 'ContextEstablished');
    await service.advance('ctx-1', 'Dispatched');
    await service.advance('ctx-1', 'Failed');

    await expect(service.advance('ctx-1', 'Running')).rejects.toThrow();
  });

  it('history preserva cada transição como um fato imutável distinto', async () => {
    const service = new ExecutionLifecycleService(new FakeExecutionLifecycleStateRepository());
    await service.start('ctx-1');
    await service.advance('ctx-1', 'ContextEstablished');

    const history = await service.history('ctx-1');

    expect(history.map((s) => s.stage)).toEqual(['Received', 'ContextEstablished']);
  });
});
