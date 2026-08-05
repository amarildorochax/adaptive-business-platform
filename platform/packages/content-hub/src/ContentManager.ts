import type { Article } from './Article';
import { ArticleService, type CreateArticleInput } from './ArticleService';
import { ArticleVersionService } from './ArticleVersionService';
import type { Author } from './Author';
import { AuthorService, type CreateAuthorInput } from './AuthorService';
import type { Category } from './Category';
import { CategoryService, type CreateCategoryInput } from './CategoryService';
import type { ContentEvent, ContentEventType } from './ContentEvent';
import type { ContentTag } from './ContentTag';
import { ContentTagService, type CreateContentTagInput } from './ContentTagService';
import type { Page } from './Page';
import { PageService, type CreatePageInput } from './PageService';

export interface ContentManagerDependencies {
  readonly articles: ArticleService;
  readonly articleVersions: ArticleVersionService;
  readonly categories: CategoryService;
  readonly contentTags: ContentTagService;
  readonly authors: AuthorService;
  readonly pages: PageService;
}

/**
 * Resultado de uma operação de ContentManager. Diferente de `CRMOperationResult` (IMP-002) e de
 * `CommOperationResult` (IMP-003), este tipo nunca carrega um Command — `CONTENT_HUB_ARCHITECTURE.md`
 * nunca catalogou formalmente um conjunto de Commands do Content Hub (apenas um catálogo de
 * dezenove Eventos, Capítulo 27); ver a lacuna arquitetural registrada em
 * CONTENT_CORE_MIGRATION_REPORT.md. Inventar um `ContentCommandType` sem precedente no Blueprint
 * violaria "não criar Commands novos por iniciativa própria", regra explícita desta Sprint.
 */
export interface ContentOperationResult<TEntity> {
  readonly result: TEntity;
  readonly events: readonly ContentEvent[];
}

/**
 * ContentManager — o primeiro Domain Manager do Content Hub, cobrindo o escopo de Fase 1 já
 * previsto no próprio Blueprint (`CONTENT_HUB_ARCHITECTURE.md`, Capítulo 34: "Fase 1 — CMS Engine
 * e Blog Manager"): ciclo de vida de Article, e a Taxonomia/Autoria genérica do CMS Engine
 * (Category, ContentTag, Author, Page). Landing Page Builder, SEO Manager, Media Library, Download
 * Center, Form Builder, CTA Manager, Newsletter Manager e Web Stories Manager pertencem às Fases
 * 3–7 já sequenciadas naquele mesmo Roadmap, fora do escopo desta Sprint.
 *
 * Nunca cria `Lead` — quando o Form Builder existir (Fase 5), publicará `LeadCaptured` como fato,
 * nunca a Entidade em si, aplicação direta de ADR-CH-001. Nunca calcula Metric/KPI — aplicação de
 * ADR-CH-006. Nunca publica em nenhum Event Bus real — mesmo padrão "Domain Events coletados,
 * despachados pela infraestrutura" já usado por `CRMManager` e `CommunicationManager`.
 */
export class ContentManager {
  constructor(private readonly deps: ContentManagerDependencies) {}

  async createArticle(input: CreateArticleInput): Promise<ContentOperationResult<Article>> {
    const article = await this.deps.articles.create(input);
    await this.deps.articleVersions.snapshot(article.articleId, article.title, article.body);

    return { result: article, events: [this.event('ArticleCreated', article.articleId)] };
  }

  /** Atualiza o conteúdo de um Article já existente, produzindo uma nova ArticleVersion (auditoria). */
  async updateArticle(articleId: string, title: string, body: string): Promise<ContentOperationResult<Article>> {
    const article = await this.deps.articles.updateContent(articleId, title, body);
    await this.deps.articleVersions.snapshot(article.articleId, article.title, article.body);

    return { result: article, events: [this.event('ArticleUpdated', articleId)] };
  }

  async publishArticle(articleId: string): Promise<ContentOperationResult<Article>> {
    const article = await this.deps.articles.transitionTo(articleId, 'Published');
    await this.deps.articleVersions.snapshot(article.articleId, article.title, article.body);

    return { result: article, events: [this.event('ArticlePublished', articleId)] };
  }

  async archiveArticle(articleId: string): Promise<ContentOperationResult<Article>> {
    const article = await this.deps.articles.transitionTo(articleId, 'Archived');

    return { result: article, events: [this.event('ArticleArchived', articleId)] };
  }

  /**
   * Categoria, ContentTag e Author — nenhum dos três tem Evento de domínio próprio no catálogo já
   * aprovado (`ContentEvent.ts`); as três operações abaixo retornam `events: []`, deliberadamente,
   * nunca inventando um Evento sem precedente no Blueprint.
   */
  async createCategory(input: CreateCategoryInput): Promise<ContentOperationResult<Category>> {
    const category = await this.deps.categories.create(input);
    return { result: category, events: [] };
  }

  async createContentTag(input: CreateContentTagInput): Promise<ContentOperationResult<ContentTag>> {
    const tag = await this.deps.contentTags.create(input);
    return { result: tag, events: [] };
  }

  async createAuthor(input: CreateAuthorInput): Promise<ContentOperationResult<Author>> {
    const author = await this.deps.authors.create(input);
    return { result: author, events: [] };
  }

  /** Page também não tem Evento de domínio próprio no catálogo já aprovado — ver Nota acima. */
  async createPage(input: CreatePageInput): Promise<ContentOperationResult<Page>> {
    const page = await this.deps.pages.create(input);
    return { result: page, events: [] };
  }

  async publishPage(pageId: string): Promise<ContentOperationResult<Page>> {
    const page = await this.deps.pages.transitionTo(pageId, 'Published');
    return { result: page, events: [] };
  }

  async archivePage(pageId: string): Promise<ContentOperationResult<Page>> {
    const page = await this.deps.pages.transitionTo(pageId, 'Archived');
    return { result: page, events: [] };
  }

  private event(type: ContentEventType, articleId?: string): ContentEvent {
    return { eventId: crypto.randomUUID(), type, articleId, occurredAt: new Date() };
  }
}
