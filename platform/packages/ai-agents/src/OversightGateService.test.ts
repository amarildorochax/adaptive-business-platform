import { describe, expect, it } from 'vitest';
import { OversightGateService } from './OversightGateService';
import { FakeOversightCheckpointRepository } from './testing/InMemoryFakes';

describe('OversightGateService — "nunca liberando silenciosamente um resultado de alto impacto"', () => {
  it('evaluate retorna undefined quando a finalidade não exige confirmação — resultado liberado sem retenção', async () => {
    const service = new OversightGateService(new FakeOversightCheckpointRepository());

    const checkpoint = await service.evaluate('result-1', false);

    expect(checkpoint).toBeUndefined();
    expect(await service.isRetained('result-1')).toBe(false);
  });

  it('evaluate cria um Checkpoint Pending quando a finalidade exige confirmação — resultado retido', async () => {
    const service = new OversightGateService(new FakeOversightCheckpointRepository());

    const checkpoint = await service.evaluate('result-1', true);

    expect(checkpoint?.status).toBe('Pending');
    expect(await service.isRetained('result-1')).toBe(true);
  });

  it('approve libera o resultado — isRetained passa a false', async () => {
    const service = new OversightGateService(new FakeOversightCheckpointRepository());
    const checkpoint = await service.evaluate('result-1', true);

    await service.approve(checkpoint!.oversightCheckpointId, 'identity-1');

    expect(await service.isRetained('result-1')).toBe(false);
  });

  it('nunca permite resolver um Checkpoint já resolvido', async () => {
    const service = new OversightGateService(new FakeOversightCheckpointRepository());
    const checkpoint = await service.evaluate('result-1', true);
    await service.deny(checkpoint!.oversightCheckpointId, 'identity-1');

    await expect(service.approve(checkpoint!.oversightCheckpointId, 'identity-1')).rejects.toThrow();
  });
});
