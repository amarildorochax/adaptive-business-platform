/**
 * Article — unidade central de conteúdo de longa duração, proprietária do Blog Manager.
 * Estrutura definida em `CONTENT_HUB_ARCHITECTURE.md`, Capítulo 22.
 *
 * O ciclo de vida abaixo preserva integralmente as sete etapas já descritas no Capítulo 23.1
 * daquele documento ("Ideia → Rascunho → Revisão → Aprovação → Publicado → Desatualizado →
 * Arquivado"), sem remover, renomear ou reordenar nenhuma.
 */
export type ArticleStatus =
  | 'Idea'
  | 'Draft'
  | 'Review'
  | 'Approval'
  | 'Published'
  | 'Outdated'
  | 'Archived';

export interface Article {
  /** Identificador do Article. */
  readonly articleId: string;

  /** Tenant ao qual o Article pertence. */
  readonly tenantId: string;

  /** Título do Article. */
  readonly title: string;

  /** Conteúdo textual do Article. */
  readonly body: string;

  /** Estado atual no ciclo de vida editorial. */
  readonly status: ArticleStatus;

  /** Author responsável pela autoria — ver Author.ts. */
  readonly authorId: string;

  /** Category à qual este Article pertence, quando classificado. */
  readonly categoryId?: string;

  /** Momento de criação. */
  readonly createdAt: Date;

  /** Momento da última atualização de conteúdo. */
  readonly updatedAt: Date;
}
