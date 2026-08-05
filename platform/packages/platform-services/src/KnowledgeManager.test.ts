import { describe, expect, it } from 'vitest';
import { KnowledgeAssetService } from './KnowledgeAssetService';
import { KnowledgeIndexService } from './KnowledgeIndexService';
import { KnowledgeLifecycleService } from './KnowledgeLifecycleService';
import { KnowledgeManager } from './KnowledgeManager';
import { KnowledgeSearchService } from './KnowledgeSearchService';
import { KnowledgeVersionService } from './KnowledgeVersionService';
import {
  FakeIndexEntryRepository,
  FakeKnowledgeAssetRepository,
  FakeKnowledgeLifecycleStateRepository,
  FakeKnowledgeVersionRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  const assetRepository = new FakeKnowledgeAssetRepository();
  const indexRepository = new FakeIndexEntryRepository();

  const manager = new KnowledgeManager({
    assets: new KnowledgeAssetService(assetRepository),
    lifecycle: new KnowledgeLifecycleService(new FakeKnowledgeLifecycleStateRepository()),
    versions: new KnowledgeVersionService(new FakeKnowledgeVersionRepository()),
    index: new KnowledgeIndexService(indexRepository),
    search: new KnowledgeSearchService(assetRepository, indexRepository),
  });

  return { manager };
}

describe('KnowledgeManager — Knowledge Hub Core ("armazenar, organizar, versionar, indexar e disponibilizar")', () => {
  it('createKnowledge carrega command "CreateKnowledge" e evento "KnowledgeCreated" — catálogo formal existe para este domínio', async () => {
    const { manager } = buildManager();

    const created = await manager.createKnowledge({ tenantId: 'tenant-1', type: 'Procedimento', category: 'atendimento', tags: ['onboarding'] });

    expect(created.result.type).toBe('Procedimento');
    expect(created.command?.name).toBe('CreateKnowledge');
    expect(created.events?.[0]?.name).toBe('KnowledgeCreated');
  });

  it('transições sem Command catalogado (submitForReview, approve, publish) retornam apenas { result }', async () => {
    const { manager } = buildManager();
    const created = await manager.createKnowledge({ tenantId: 'tenant-1', type: 'FAQ', tags: [] });

    const reviewed = await manager.submitForReview(created.result.assetId);

    expect(reviewed.result.stage).toBe('Revisão');
    expect('command' in reviewed).toBe(false);
    expect('events' in reviewed).toBe(false);
  });

  it('fluxo completo: createKnowledge → submitForReview → approve → publish → indexKnowledge → markInUse', async () => {
    const { manager } = buildManager();
    const created = await manager.createKnowledge({ tenantId: 'tenant-1', type: 'Política', tags: ['reembolso'] });
    const assetId = created.result.assetId;

    await manager.submitForReview(assetId);
    await manager.approve(assetId);
    await manager.publish(assetId);
    const indexed = await manager.indexKnowledge({ assetId, tenantId: 'tenant-1' });
    const used = await manager.markInUse(assetId);

    expect(indexed.command?.name).toBe('IndexKnowledge');
    expect(indexed.events?.[0]?.name).toBe('KnowledgeIndexed');
    expect(used.result.stage).toBe('Uso');
  });

  it('updateKnowledge carrega command "UpdateKnowledge" e evento "KnowledgeUpdated" com a nova versão', async () => {
    const { manager } = buildManager();
    const created = await manager.createKnowledge({ tenantId: 'tenant-1', type: 'Manual', tags: [] });
    const assetId = created.result.assetId;
    await manager.submitForReview(assetId);
    await manager.approve(assetId);
    await manager.publish(assetId);
    await manager.indexKnowledge({ assetId, tenantId: 'tenant-1' });
    await manager.markInUse(assetId);

    const updated = await manager.updateKnowledge({ assetId, tenantId: 'tenant-1' });

    expect(updated.result.version).toBe(2);
    expect(updated.command?.name).toBe('UpdateKnowledge');
    expect((updated.events?.[0]?.payload as { version: number }).version).toBe(2);
  });

  it('archiveKnowledge carrega command "ArchiveKnowledge" e evento "KnowledgeArchived"', async () => {
    const { manager } = buildManager();
    const created = await manager.createKnowledge({ tenantId: 'tenant-1', type: 'Contrato', tags: [] });
    const assetId = created.result.assetId;
    await manager.submitForReview(assetId);
    await manager.approve(assetId);
    await manager.publish(assetId);
    await manager.indexKnowledge({ assetId, tenantId: 'tenant-1' });
    await manager.markInUse(assetId);
    await manager.updateKnowledge({ assetId, tenantId: 'tenant-1' });

    const archived = await manager.archiveKnowledge({ assetId, tenantId: 'tenant-1', reason: 'conteúdo obsoleto' });

    expect(archived.result.stage).toBe('Arquivamento');
    expect(archived.command?.name).toBe('ArchiveKnowledge');
    expect(archived.events?.[0]?.name).toBe('KnowledgeArchived');
  });

  it('recoverKnowledge nunca carrega command nem events — nenhum catálogo aprovado existe para esta transição', async () => {
    const { manager } = buildManager();
    const created = await manager.createKnowledge({ tenantId: 'tenant-1', type: 'Template', tags: [] });
    const assetId = created.result.assetId;
    await manager.submitForReview(assetId);
    await manager.approve(assetId);
    await manager.publish(assetId);
    await manager.indexKnowledge({ assetId, tenantId: 'tenant-1' });
    await manager.markInUse(assetId);
    await manager.updateKnowledge({ assetId, tenantId: 'tenant-1' });
    await manager.archiveKnowledge({ assetId, tenantId: 'tenant-1', reason: 'obsoleto' });

    const recovered = await manager.recoverKnowledge(assetId);

    expect(recovered.result.stage).toBe('Recuperação');
    expect('command' in recovered).toBe(false);
    expect('events' in recovered).toBe(false);
  });
});
