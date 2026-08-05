/**
 * Category — agrupamento temático amplo de conteúdo, proprietário do CMS Engine.
 * Estrutura definida em `CONTENT_HUB_ARCHITECTURE.md`, Capítulo 22.
 */
export type CategoryStatus = 'Active' | 'Archived';

export interface Category {
  /** Identificador da Category. */
  readonly categoryId: string;

  /** Tenant ao qual a Category pertence. */
  readonly tenantId: string;

  /** Nome da Category. */
  readonly name: string;

  /** Estado atual. */
  readonly status: CategoryStatus;

  /** Momento de criação. */
  readonly createdAt: Date;
}
