import { describe, expect, it } from 'vitest';
import { KnowledgeAssetService } from './KnowledgeAssetService';
import { KnowledgeIndexService } from './KnowledgeIndexService';
import { KnowledgeSearchService } from './KnowledgeSearchService';
import { FakeIndexEntryRepository, FakeKnowledgeAssetRepository } from './testing/InMemoryFakes';

describe('KnowledgeSearchService — Retrieval restrito a Tenant e a ativos já indexados', () => {
  it('nunca retorna um Asset ainda não indexado', async () => {
    const assetRepository = new FakeKnowledgeAssetRepository();
    const indexRepository = new FakeIndexEntryRepository();
    const assets = new KnowledgeAssetService(assetRepository);
    const search = new KnowledgeSearchService(assetRepository, indexRepository);

    await assets.create('tenant-1', 'FAQ', 'reembolso', ['politica']);

    const results = await search.search({ tenantId: 'tenant-1', text: 'politica' });

    expect(results).toHaveLength(0);
  });

  it('retorna resultado ranqueado por número de correspondências em category/tags, restrito ao Tenant', async () => {
    const assetRepository = new FakeKnowledgeAssetRepository();
    const indexRepository = new FakeIndexEntryRepository();
    const assets = new KnowledgeAssetService(assetRepository);
    const index = new KnowledgeIndexService(indexRepository);
    const search = new KnowledgeSearchService(assetRepository, indexRepository);

    const relevant = await assets.create('tenant-1', 'FAQ', 'reembolso', ['reembolso', 'politica-reembolso']);
    const other = await assets.create('tenant-1', 'FAQ', 'catalogo', ['produto']);
    const otherTenant = await assets.create('tenant-2', 'FAQ', 'reembolso', ['reembolso']);
    await index.index(relevant.assetId);
    await index.index(other.assetId);
    await index.index(otherTenant.assetId);

    const results = await search.search({ tenantId: 'tenant-1', text: 'reembolso' });

    expect(results).toHaveLength(1);
    expect(results[0]?.assetId).toBe(relevant.assetId);
    // category "reembolso" + tag "reembolso" + tag "politica-reembolso" (contém "reembolso") = 3 correspondências
    expect(results[0]?.rank).toBe(3);
  });
});
