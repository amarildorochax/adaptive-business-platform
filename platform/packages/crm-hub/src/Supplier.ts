/**
 * Supplier — relacionamento de fornecimento à Empresa, natureza distinta de Customer, mas gerido pelo
 * mesmo domínio por compartilhar a mesma necessidade de Timeline, Activity e Ownership. Supplier nunca
 * é fundido a Customer, mesmo quando a mesma Organização subjacente ocupa os dois papéis (ADR-008).
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Supplier {
  /** Identificador do Supplier. */
  readonly supplierId: string;

  /** Tenant ao qual o Supplier pertence. */
  readonly tenantId: string;

  /** Relationship que estrutura este Supplier — ver Relationship.ts. */
  readonly relationshipId: string;

  /** Momento de criação. */
  readonly createdAt: Date;
}
