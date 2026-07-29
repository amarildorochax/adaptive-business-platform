/**
 * Customer — relacionamento já reconhecido e ativo, a Entidade central do domínio, à qual todo
 * Opportunity, Activity e Timeline eventualmente se conecta.
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Customer {
  /** Identificador do Customer. */
  readonly customerId: string;

  /** Tenant ao qual o Customer pertence. */
  readonly tenantId: string;

  /** Relationship que estrutura este Customer — ver Relationship.ts. */
  readonly relationshipId: string;

  /** Momento de criação, por conversão de Lead ou por cadastro direto. */
  readonly createdAt: Date;
}
