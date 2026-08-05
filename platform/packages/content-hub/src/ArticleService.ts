import type { Article, ArticleStatus } from './Article';
import type { ArticleRepository } from './ArticleRepository';

/** Campos aceitos por `ArticleService.create()`. */
export type CreateArticleInput = Pick<Article, 'tenantId' | 'title' | 'body' | 'authorId' | 'categoryId'>;

/**
 * ArticleService — regra de negócio do Aggregate central do Content Hub. Inexistente em `src/core`
 * ou `src/app` (IMP-004, Etapa 1 — nenhum dos 28 diretórios de `src/core/` nem dos 14 de
 * `src/app/features/` corresponde); construído diretamente sobre o contrato descrito em
 * `CONTENT_HUB_ARCHITECTURE.md`, Capítulo 22, seguindo a mesma disciplina de responsabilidade
 * única já aplicada a `@abp/crm-hub` e `@abp/communication-hub`: nenhuma emissão de Evento aqui,
 * responsabilidade exclusiva do `ContentManager`.
 *
 * Todo Article nasce em `Idea` — o mesmo primeiro passo do ciclo de sete etapas já descrito no
 * Blueprint, Capítulo 23.1, nunca pulado.
 */
export class ArticleService {
  constructor(private readonly repository: ArticleRepository) {}

  async create(input: CreateArticleInput): Promise<Article> {
    const now = new Date();

    const article: Article = {
      articleId: crypto.randomUUID(),
      status: 'Idea',
      createdAt: now,
      updatedAt: now,
      ...input,
    };

    return this.repository.create(article);
  }

  async updateContent(articleId: string, title: string, body: string): Promise<Article> {
    const existing = await this.repository.get(articleId);

    if (!existing) {
      throw new Error(`Article ${articleId} não encontrado.`);
    }

    return this.repository.update({ ...existing, title, body, updatedAt: new Date() });
  }

  async transitionTo(articleId: string, status: ArticleStatus): Promise<Article> {
    const existing = await this.repository.get(articleId);

    if (!existing) {
      throw new Error(`Article ${articleId} não encontrado.`);
    }

    return this.repository.update({ ...existing, status, updatedAt: new Date() });
  }

  async get(articleId: string): Promise<Article | undefined> {
    return this.repository.get(articleId);
  }

  async list(tenantId: string): Promise<readonly Article[]> {
    return this.repository.list(tenantId);
  }
}
