/**
 * Catalog — a fonte única de verdade sobre o que uma Empresa vende, per
 * `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 9. Todo Product publicado pertence a exatamente um
 * Catalog.
 */
export interface Catalog {
  /** Identificador do Catalog. */
  readonly catalogId: string;

  /** Tenant ao qual o Catalog pertence. */
  readonly tenantId: string;

  /** Nome do Catalog. */
  readonly name: string;

  /** Momento de criação. */
  readonly createdAt: Date;
}
