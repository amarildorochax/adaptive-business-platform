import { describe, expect, it } from 'vitest';
import { ArticleService } from './ArticleService';
import { ArticleVersionService } from './ArticleVersionService';
import { AuthorService } from './AuthorService';
import { CategoryService } from './CategoryService';
import { ContentManager } from './ContentManager';
import { ContentTagService } from './ContentTagService';
import { PageService } from './PageService';
import {
  FakeArticleRepository,
  FakeArticleVersionRepository,
  FakeAuthorRepository,
  FakeCategoryRepository,
  FakeContentTagRepository,
  FakePageRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  return new ContentManager({
    articles: new ArticleService(new FakeArticleRepository()),
    articleVersions: new ArticleVersionService(new FakeArticleVersionRepository()),
    categories: new CategoryService(new FakeCategoryRepository()),
    contentTags: new ContentTagService(new FakeContentTagRepository()),
    authors: new AuthorService(new FakeAuthorRepository()),
    pages: new PageService(new FakePageRepository()),
  });
}

describe('ContentManager — Content Core', () => {
  it('createArticle produz o Event ArticleCreated e o resultado nunca carrega Command — nenhum está aprovado para este Hub', async () => {
    const manager = buildManager();

    const operation = await manager.createArticle({
      tenantId: 'tenant-1',
      title: 'Guia de SEO para floriculturas',
      body: 'Conteúdo inicial.',
      authorId: 'author-1',
      categoryId: undefined,
    });

    expect(operation.result.status).toBe('Idea');
    expect(operation.events.map((e) => e.type)).toEqual(['ArticleCreated']);
    expect('command' in operation).toBe(false);
  });

  it('updateArticle produz uma nova ArticleVersion e o Event ArticleUpdated', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createArticle({
      tenantId: 'tenant-1',
      title: 'Título',
      body: 'Corpo',
      authorId: 'author-1',
      categoryId: undefined,
    });

    const { result, events } = await manager.updateArticle(created.articleId, 'Novo título', 'Novo corpo');

    expect(result.title).toBe('Novo título');
    expect(events.map((e) => e.type)).toEqual(['ArticleUpdated']);
  });

  it('publishArticle transiciona para Published e produz o Event ArticlePublished', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createArticle({
      tenantId: 'tenant-1',
      title: 'Título',
      body: 'Corpo',
      authorId: 'author-1',
      categoryId: undefined,
    });

    const { result, events } = await manager.publishArticle(created.articleId);

    expect(result.status).toBe('Published');
    expect(events.map((e) => e.type)).toEqual(['ArticlePublished']);
  });

  it('archiveArticle transiciona para Archived e produz o Event ArticleArchived', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createArticle({
      tenantId: 'tenant-1',
      title: 'Título',
      body: 'Corpo',
      authorId: 'author-1',
      categoryId: undefined,
    });
    await manager.publishArticle(created.articleId);

    const { result, events } = await manager.archiveArticle(created.articleId);

    expect(result.status).toBe('Archived');
    expect(events.map((e) => e.type)).toEqual(['ArticleArchived']);
  });

  it('createCategory, createContentTag, createAuthor e createPage nunca emitem Event — nenhum está catalogado para essas Entidades', async () => {
    const manager = buildManager();

    const category = await manager.createCategory({ tenantId: 'tenant-1', name: 'Casamentos' });
    const tag = await manager.createContentTag({ tenantId: 'tenant-1', label: 'buquê' });
    const author = await manager.createAuthor({
      tenantId: 'tenant-1',
      name: 'Redator Agent',
      isAgent: true,
      identityReferenceId: undefined,
    });
    const page = await manager.createPage({
      tenantId: 'tenant-1',
      title: 'Sobre nós',
      body: 'Texto institucional.',
    });

    expect(category.events).toEqual([]);
    expect(tag.events).toEqual([]);
    expect(author.events).toEqual([]);
    expect(page.events).toEqual([]);
  });

  it('Author nunca duplica Identity — isAgent distingue Agente de IA de usuário humano referenciado por identificador opaco', async () => {
    const manager = buildManager();

    const humanAuthor = await manager.createAuthor({
      tenantId: 'tenant-1',
      name: 'Ana Redatora',
      isAgent: false,
      identityReferenceId: 'identity-user-42',
    });

    expect(humanAuthor.result.isAgent).toBe(false);
    expect(humanAuthor.result.identityReferenceId).toBe('identity-user-42');
  });

  it('publishPage e archivePage transicionam o estado sem produzir Event', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createPage({
      tenantId: 'tenant-1',
      title: 'Política de privacidade',
      body: 'Texto.',
    });

    const published = await manager.publishPage(created.pageId);
    expect(published.result.status).toBe('Published');
    expect(published.events).toEqual([]);

    const archived = await manager.archivePage(created.pageId);
    expect(archived.result.status).toBe('Archived');
    expect(archived.events).toEqual([]);
  });
});
