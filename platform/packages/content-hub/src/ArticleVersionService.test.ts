import { describe, expect, it } from 'vitest';
import { ArticleVersionService } from './ArticleVersionService';
import { FakeArticleVersionRepository } from './testing/InMemoryFakes';

describe('ArticleVersionService', () => {
  it('cada snapshot é um novo registro imutável, nunca uma sobrescrita', async () => {
    const service = new ArticleVersionService(new FakeArticleVersionRepository());

    const first = await service.snapshot('article-1', 'Título v1', 'Corpo v1');
    const second = await service.snapshot('article-1', 'Título v2', 'Corpo v2');

    const versions = await service.listByArticle('article-1');

    expect(versions).toHaveLength(2);
    expect(versions[0]?.articleVersionId).toBe(first.articleVersionId);
    expect(versions[0]?.title).toBe('Título v1');
    expect(versions[1]?.articleVersionId).toBe(second.articleVersionId);
    expect(versions[1]?.title).toBe('Título v2');
  });

  it('ArticleVersionRepository nunca expõe update — apenas add e listByArticle', () => {
    const service = new ArticleVersionService(new FakeArticleVersionRepository());
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(service));

    expect(methodNames).not.toContain('update');
  });
});
