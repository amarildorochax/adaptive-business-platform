import { describe, expect, it } from 'vitest';
import { ExecutionContextService } from './ExecutionContextService';
import { FakeExecutionContextRepository } from './testing/InMemoryFakes';

describe('ExecutionContextService', () => {
  it('establish cria um Execution Context com correlação, Tenant e Identidade opacos', async () => {
    const service = new ExecutionContextService(new FakeExecutionContextRepository());

    const context = await service.establish('corr-1', 'tenant-1', 'identity-1');

    expect(context.correlationId).toBe('corr-1');
    expect(context.tenantId).toBe('tenant-1');
    expect(context.identityId).toBe('identity-1');
  });

  it('find recupera um Execution Context já estabelecido', async () => {
    const service = new ExecutionContextService(new FakeExecutionContextRepository());
    const context = await service.establish('corr-1', 'tenant-1', 'identity-1');

    const found = await service.find(context.executionContextId);

    expect(found?.executionContextId).toBe(context.executionContextId);
  });
});
