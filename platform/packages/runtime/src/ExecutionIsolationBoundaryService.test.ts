import { describe, expect, it } from 'vitest';
import { ExecutionIsolationBoundaryService } from './ExecutionIsolationBoundaryService';
import { FakeExecutionIsolationBoundaryRepository } from './testing/InMemoryFakes';

describe('ExecutionIsolationBoundaryService — "duas execuções... nunca compartilham Execution Context"', () => {
  it('establish cria o Isolation Boundary de um Execution Context', async () => {
    const service = new ExecutionIsolationBoundaryService(new FakeExecutionIsolationBoundaryRepository());

    const boundary = await service.establish('ctx-1', 'tenant-1');

    expect(boundary.executionContextId).toBe('ctx-1');
    expect(boundary.tenantId).toBe('tenant-1');
  });

  it('nunca permite estabelecer um segundo Isolation Boundary para o mesmo Execution Context', async () => {
    const service = new ExecutionIsolationBoundaryService(new FakeExecutionIsolationBoundaryRepository());
    await service.establish('ctx-1', 'tenant-1');

    await expect(service.establish('ctx-1', 'tenant-1')).rejects.toThrow();
  });
});
