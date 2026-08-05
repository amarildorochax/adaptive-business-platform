import type { Article } from './Article';

/**
 * ArticleRepository — contrato de persistência de Article. Apenas a interface; nenhuma
 * implementação de armazenamento é fornecida por este pacote (IMP-004, Etapa 7 — mesma regra já
 * aplicada em `@abp/crm-hub` e `@abp/communication-hub`).
 */
export interface ArticleRepository {
  create(article: Article): Promise<Article>;
  update(article: Article): Promise<Article>;
  get(articleId: string): Promise<Article | undefined>;
  list(tenantId: string): Promise<readonly Article[]>;
}
