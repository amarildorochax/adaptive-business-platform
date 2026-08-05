import { describe, expect, it } from 'vitest';
import { KnowledgeVersionService } from './KnowledgeVersionService';
import { FakeKnowledgeVersionRepository } from './testing/InMemoryFakes';

describe('KnowledgeVersionService — "nenhuma atualização de conhecimento sobrescreve silenciosamente o que existia antes"', () => {
  it('record numera as versões sequencialmente a partir do próprio histórico', async () => {
    const service = new KnowledgeVersionService(new FakeKnowledgeVersionRepository());

    const v1 = await service.record('asset-1');
    const v2 = await service.record('asset-1');

    expect(v1.version).toBe(1);
    expect(v2.version).toBe(2);
    expect(await service.currentVersion('asset-1')).toBe(2);
  });

  it('history preserva cada versão anterior — nenhuma é descartada', async () => {
    const service = new KnowledgeVersionService(new FakeKnowledgeVersionRepository());
    await service.record('asset-1');
    await service.record('asset-1');

    const history = await service.history('asset-1');

    expect(history.map((v) => v.version)).toEqual([1, 2]);
  });
});
