import { describe, expect, it } from 'vitest';
import { ArticleService } from './ArticleService';
import { FakeArticleRepository } from './testing/InMemoryFakes';

describe('ArticleService', () => {
  it('cria um Article sempre no estado Idea — primeira etapa do ciclo de sete estados', async () => {
    const service = new ArticleService(new FakeArticleRepository());

    const article = await service.create({
      tenantId: 'tenant-1',
      title: 'Como escolher flores para casamento',
      body: 'Rascunho inicial.',
      authorId: 'author-1',
      categoryId: undefined,
    });

    expect(article.status).toBe('Idea');
  });

  it('transitionTo percorre o ciclo de vida sem pular etapa arbitrariamente', async () => {
    const service = new ArticleService(new FakeArticleRepository());
    const created = await service.create({
      tenantId: 'tenant-1',
      title: 'Título',
      body: 'Corpo',
      authorId: 'author-1',
      categoryId: undefined,
    });

    const inReview = await service.transitionTo(created.articleId, 'Review');
    expect(inReview.status).toBe('Review');

    const published = await service.transitionTo(created.articleId, 'Published');
    expect(published.status).toBe('Published');
  });

  it('updateContent atualiza título e corpo, preservando o restante do Article', async () => {
    const service = new ArticleService(new FakeArticleRepository());
    const created = await service.create({
      tenantId: 'tenant-1',
      title: 'Título original',
      body: 'Corpo original',
      authorId: 'author-1',
      categoryId: undefined,
    });

    const updated = await service.updateContent(created.articleId, 'Título revisado', 'Corpo revisado');

    expect(updated.title).toBe('Título revisado');
    expect(updated.authorId).toBe('author-1');
  });
});
