import { describe, expect, it } from 'vitest';
import { BusinessMaturityService } from './BusinessMaturityService';
import { FakeMaturityRecordRepository } from './testing/InMemoryFakes';

describe('BusinessMaturityService — Business Maturity Engine, versionado independentemente da Classificação (ADR-006)', () => {
  it('assess registra a Maturidade como primeira versão', async () => {
    const service = new BusinessMaturityService(new FakeMaturityRecordRepository());

    const record = await service.assess('profile-1', 'baixa');

    expect(record.version).toBe(1);
    expect(record.maturity).toBe('baixa');
  });

  it('current reflete sempre a Maturidade mais recente', async () => {
    const service = new BusinessMaturityService(new FakeMaturityRecordRepository());
    await service.assess('profile-1', 'baixa');
    await service.assess('profile-1', 'elevada');

    expect(await service.current('profile-1')).toBe('elevada');
  });
});
