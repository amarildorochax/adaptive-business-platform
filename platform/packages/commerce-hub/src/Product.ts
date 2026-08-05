/**
 * Product — a fonte única de verdade sobre um item vendável, per `COMMERCE_HUB_ARCHITECTURE.md`,
 * Capítulo 9. Ciclo de vida próprio (Capítulo 10): rascunho → publicado → descontinuado, nunca
 * removido fisicamente (Soft Delete, mesmo padrão de `CRM_HUB.md`, ADR-008, aplicado por analogia).
 */
export type ProductStatus = 'Draft' | 'Published' | 'Discontinued';

export interface Product {
  /** Identificador do Product. */
  readonly productId: string;

  /** Tenant ao qual o Product pertence. */
  readonly tenantId: string;

  /** Catalog ao qual este Product está publicado. */
  readonly catalogId: string;

  /** Category à qual este Product está associado, quando aplicável. */
  readonly categoryId?: string;

  /** Nome do Product. */
  readonly name: string;

  /** Descrição do Product. */
  readonly description?: string;

  /** Estado do ciclo de vida. */
  readonly status: ProductStatus;

  /** Momento de criação. */
  readonly createdAt: Date;

  /** Momento da última atualização. */
  readonly updatedAt: Date;
}
