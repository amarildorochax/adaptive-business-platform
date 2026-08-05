import { describe, expect, it } from 'vitest';
import { BusinessProfileService } from './BusinessProfileService';
import { FakeBusinessProfileRepository } from './testing/InMemoryFakes';

describe('BusinessProfileService — "Todo Tenant possui exatamente um Business Profile ativo" (ADR-001)', () => {
  it('create registra um Business Profile associado ao Tenant', async () => {
    const service = new BusinessProfileService(new FakeBusinessProfileRepository());

    const profile = await service.create('tenant-1');

    expect(profile.tenantId).toBe('tenant-1');
  });

  it('nunca permite um segundo Business Profile ativo para o mesmo Tenant', async () => {
    const service = new BusinessProfileService(new FakeBusinessProfileRepository());
    await service.create('tenant-1');

    await expect(service.create('tenant-1')).rejects.toThrow();
  });
});
