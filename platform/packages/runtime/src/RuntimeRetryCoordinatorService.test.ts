import { describe, expect, it } from 'vitest';
import { RuntimeRetryCoordinatorService } from './RuntimeRetryCoordinatorService';
import { FakeDispatchRetryAttemptRepository } from './testing/InMemoryFakes';

describe('RuntimeRetryCoordinatorService — "nova tentativa de nível de transporte... antes de a solicitação alcançar seu destino"', () => {
  it('recordAttempt numera as tentativas sequencialmente a partir do próprio histórico', async () => {
    const service = new RuntimeRetryCoordinatorService(new FakeDispatchRetryAttemptRepository());

    const first = await service.recordAttempt('ctx-1', 'target-1');
    const second = await service.recordAttempt('ctx-1', 'target-1');

    expect(first.attemptNumber).toBe(1);
    expect(second.attemptNumber).toBe(2);
  });

  it('history nunca mistura tentativas de Execution Context distintos', async () => {
    const service = new RuntimeRetryCoordinatorService(new FakeDispatchRetryAttemptRepository());
    await service.recordAttempt('ctx-1', 'target-1');
    await service.recordAttempt('ctx-2', 'target-1');

    const history = await service.history('ctx-1');

    expect(history).toHaveLength(1);
  });
});
