import type { Article } from '../Article';
import type { ArticleRepository } from '../ArticleRepository';
import type { ArticleVersion } from '../ArticleVersion';
import type { ArticleVersionRepository } from '../ArticleVersionRepository';
import type { Author } from '../Author';
import type { AuthorRepository } from '../AuthorRepository';
import type { Category } from '../Category';
import type { CategoryRepository } from '../CategoryRepository';
import type { ContentTag } from '../ContentTag';
import type { ContentTagRepository } from '../ContentTagRepository';
import type { Page } from '../Page';
import type { PageRepository } from '../PageRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-004, Etapa 9). Mesmo padrão já usado por
 * `@abp/crm-hub` (IMP-002) e `@abp/communication-hub` (IMP-003) — nunca exportados pelo barrel do
 * pacote, nunca referenciados por nenhum Service em produção.
 */

export class FakeArticleRepository implements ArticleRepository {
  private readonly rows = new Map<string, Article>();
  async create(article: Article) {
    this.rows.set(article.articleId, article);
    return article;
  }
  async update(article: Article) {
    this.rows.set(article.articleId, article);
    return article;
  }
  async get(articleId: string) {
    return this.rows.get(articleId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((a) => a.tenantId === tenantId);
  }
}

export class FakeArticleVersionRepository implements ArticleVersionRepository {
  private readonly rows: ArticleVersion[] = [];
  async add(version: ArticleVersion) {
    this.rows.push(version);
    return version;
  }
  async listByArticle(articleId: string) {
    return this.rows.filter((v) => v.articleId === articleId);
  }
}

export class FakeCategoryRepository implements CategoryRepository {
  private readonly rows = new Map<string, Category>();
  async create(category: Category) {
    this.rows.set(category.categoryId, category);
    return category;
  }
  async get(categoryId: string) {
    return this.rows.get(categoryId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((c) => c.tenantId === tenantId);
  }
}

export class FakeContentTagRepository implements ContentTagRepository {
  private readonly rows = new Map<string, ContentTag>();
  async create(tag: ContentTag) {
    this.rows.set(tag.contentTagId, tag);
    return tag;
  }
  async get(contentTagId: string) {
    return this.rows.get(contentTagId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((t) => t.tenantId === tenantId);
  }
}

export class FakeAuthorRepository implements AuthorRepository {
  private readonly rows = new Map<string, Author>();
  async create(author: Author) {
    this.rows.set(author.authorId, author);
    return author;
  }
  async get(authorId: string) {
    return this.rows.get(authorId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((a) => a.tenantId === tenantId);
  }
}

export class FakePageRepository implements PageRepository {
  private readonly rows = new Map<string, Page>();
  async create(page: Page) {
    this.rows.set(page.pageId, page);
    return page;
  }
  async update(page: Page) {
    this.rows.set(page.pageId, page);
    return page;
  }
  async get(pageId: string) {
    return this.rows.get(pageId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((p) => p.tenantId === tenantId);
  }
}
