import { describe, expect, it } from 'vitest';
import { KnowledgeConnectorService } from './KnowledgeConnectorService';
import { FakeKnowledgeAssetQuery } from './testing/InMemoryFakes';

describe('KnowledgeConnectorService — nunca armazena conhecimento, apenas consulta (AI_HUB.md, Capítulo 12)', () => {
  it('consult sem tags retorna todo Knowledge Asset do Tenant', async () => {
    const query = new FakeKnowledgeAssetQuery();
    query.seed({ assetId: 'asset-1', tenantId: 'tenant-1', type: 'Documento', tags: ['politica'] });
    const service = new KnowledgeConnectorService(query);

    const assets = await service.consult('tenant-1');

    expect(assets).toHaveLength(1);
  });

  it('consult com tags filtra apenas Knowledge Asset com correspondência', async () => {
    const query = new FakeKnowledgeAssetQuery();
    query.seed(
      { assetId: 'asset-1', tenantId: 'tenant-1', type: 'Documento', tags: ['politica-de-reembolso'] },
      { assetId: 'asset-2', tenantId: 'tenant-1', type: 'Documento', tags: ['catalogo'] },
    );
    const service = new KnowledgeConnectorService(query);

    const assets = await service.consult('tenant-1', ['politica-de-reembolso']);

    expect(assets).toHaveLength(1);
    expect(assets[0]?.assetId).toBe('asset-1');
  });
});
