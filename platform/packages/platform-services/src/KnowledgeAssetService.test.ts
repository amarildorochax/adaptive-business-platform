import { describe, expect, it } from 'vitest';
import { KnowledgeAssetService } from './KnowledgeAssetService';
import { FakeKnowledgeAssetRepository } from './testing/InMemoryFakes';

describe('KnowledgeAssetService', () => {
  it('create registra um Knowledge Asset isolado por Tenant', async () => {
    const service = new KnowledgeAssetService(new FakeKnowledgeAssetRepository());

    const asset = await service.create('tenant-1', 'Procedimento', 'atendimento', ['fechamento-caixa']);

    expect(asset.tenantId).toBe('tenant-1');
    expect(asset.type).toBe('Procedimento');
    expect(asset.tags).toEqual(['fechamento-caixa']);
  });

  it('listByTenant nunca retorna Asset de outro Tenant', async () => {
    const service = new KnowledgeAssetService(new FakeKnowledgeAssetRepository());
    await service.create('tenant-1', 'FAQ', undefined, []);
    await service.create('tenant-2', 'FAQ', undefined, []);

    const results = await service.listByTenant('tenant-1');

    expect(results).toHaveLength(1);
    expect(results[0]?.tenantId).toBe('tenant-1');
  });
});
