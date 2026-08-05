/**
 * ArticleVersion — snapshot imutável de uma revisão de Article, criada a cada publicação ou
 * atualização, nunca editada após criação — o próprio mecanismo de auditoria de conteúdo já
 * descrito em `CONTENT_HUB_ARCHITECTURE.md`, Capítulo 30 ("toda mudança publicada em um Article
 * já produzido gera uma nova versão rastreável, nunca uma sobrescrita silenciosa").
 * Estrutura definida em `CONTENT_HUB_ARCHITECTURE.md`, Capítulo 22.
 */
export interface ArticleVersion {
  /** Identificador da ArticleVersion. */
  readonly articleVersionId: string;

  /** Article ao qual esta versão pertence. */
  readonly articleId: string;

  /** Snapshot do título no momento desta versão. */
  readonly title: string;

  /** Snapshot do conteúdo no momento desta versão. */
  readonly body: string;

  /** Momento de criação desta versão. */
  readonly createdAt: Date;
}
