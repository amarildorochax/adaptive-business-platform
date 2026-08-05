import type { ArticleVersion } from './ArticleVersion';

/**
 * ArticleVersionRepository — contrato de persistência de ArticleVersion. Interface apenas, per
 * IMP-004, Etapa 7. Deliberadamente sem `update`/`remove` — cada versão é um snapshot imutável
 * (`CONTENT_HUB_ARCHITECTURE.md`, Capítulo 30), nunca reescrita.
 */
export interface ArticleVersionRepository {
  add(version: ArticleVersion): Promise<ArticleVersion>;
  listByArticle(articleId: string): Promise<readonly ArticleVersion[]>;
}
