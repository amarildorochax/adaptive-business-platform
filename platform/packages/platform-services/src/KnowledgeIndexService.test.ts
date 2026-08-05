import { describe, expect, it } from 'vitest';
import { KnowledgeIndexService } from './KnowledgeIndexService';
import { FakeIndexEntryRepository } from './testing/InMemoryFakes';

describe('KnowledgeIndexService — "garantindo que uma nova versão de documento, uma vez publicada, esteja pesquisável"', () => {
  it('isIndexed é falso antes de index e verdadeiro depois', async () => {
    const service = new KnowledgeIndexService(new FakeIndexEntryRepository());

    expect(await service.isIndexed('asset-1')).toBe(false);

    await service.index('asset-1');

    expect(await service.isIndexed('asset-1')).toBe(true);
  });
});
