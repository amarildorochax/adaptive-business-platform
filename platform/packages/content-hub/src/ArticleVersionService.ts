import type { ArticleVersion } from './ArticleVersion';
import type { ArticleVersionRepository } from './ArticleVersionRepository';

/**
 * ArticleVersionService — cria o snapshot imutável de auditoria a cada publicação ou atualização
 * de Article, nunca atualiza um snapshot já existente. Inexistente em `src/core` ou `src/app`
 * (IMP-004, Etapa 1); construído diretamente sobre o contrato já descrito.
 */
export class ArticleVersionService {
  constructor(private readonly repository: ArticleVersionRepository) {}

  async snapshot(articleId: string, title: string, body: string): Promise<ArticleVersion> {
    const version: ArticleVersion = {
      articleVersionId: crypto.randomUUID(),
      articleId,
      title,
      body,
      createdAt: new Date(),
    };

    return this.repository.add(version);
  }

  async listByArticle(articleId: string): Promise<readonly ArticleVersion[]> {
    return this.repository.listByArticle(articleId);
  }
}
