/**
 * Tag — rótulo livre, de menor formalidade que Segment, aplicável a qualquer Relationship para
 * organização ad hoc.
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Tag {
  /** Identificador da Tag. */
  readonly tagId: string;

  /** Tenant ao qual a Tag pertence. */
  readonly tenantId: string;

  /** Rótulo livre. */
  readonly label: string;
}
