/**
 * Address — endereço físico associado a um Relationship, podendo haver mais de um por Relationship
 * quando aplicável.
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Address {
  /** Identificador do Address. */
  readonly addressId: string;

  /** Relationship ao qual este Address está associado. */
  readonly relationshipId: string;

  /** Descrição do endereço físico. */
  readonly description: string;
}
