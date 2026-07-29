/**
 * Organization — entidade coletiva, tipicamente uma empresa-cliente, distinta de um Customer
 * individual, permitindo que múltiplos Contact se relacionem com a mesma Organization.
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Organization {
  /** Identificador da Organization. */
  readonly organizationId: string;

  /** Tenant ao qual a Organization pertence. */
  readonly tenantId: string;

  /** Relationship que estrutura esta Organization — ver Relationship.ts. */
  readonly relationshipId: string;

  /** Momento de criação. */
  readonly createdAt: Date;
}
