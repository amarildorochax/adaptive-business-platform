/**
 * Segment — agrupamento de Relationship por característica compartilhada, usado tanto para
 * organização quanto como insumo de Segmentação consumido pelo Growth Hub.
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Segment {
  /** Identificador do Segment. */
  readonly segmentId: string;

  /** Tenant ao qual o Segment pertence. */
  readonly tenantId: string;

  /** Nome do Segment. */
  readonly name: string;

  /** Relationships associados a este Segment. */
  readonly relationshipIds: readonly string[];
}
