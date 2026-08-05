import { describe, expect, it } from 'vitest';
import { HealthCheckService } from './HealthCheckService';
import { FakeHealthCheckRepository } from './testing/InMemoryFakes';

describe('HealthCheckService', () => {
  it('isHealthy retorna undefined quando nenhuma verificação ainda existe para o componente', async () => {
    const service = new HealthCheckService(new FakeHealthCheckRepository());

    const healthy = await service.isHealthy('finance-hub');

    expect(healthy).toBeUndefined();
  });

  it('isHealthy reflete a verificação mais recente, nunca uma anterior', async () => {
    const service = new HealthCheckService(new FakeHealthCheckRepository());
    await service.record('finance-hub', true);
    await service.record('finance-hub', false);

    const healthy = await service.isHealthy('finance-hub');

    expect(healthy).toBe(false);
  });
});
