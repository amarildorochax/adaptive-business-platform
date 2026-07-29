/**
 * Custom Field — campo adicional configurado por uma Empresa específica, resolvido inteiramente por
 * Configuration, sem exigir alteração do Domain Model central do CRM Hub (ADR-011).
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface CustomField {
  /** Identificador do Custom Field. */
  readonly customFieldId: string;

  /** Tenant ao qual este Custom Field pertence. */
  readonly tenantId: string;

  /** Nome do campo, configurável pela Empresa. */
  readonly name: string;
}
