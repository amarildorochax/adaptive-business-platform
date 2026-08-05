/**
 * Customer — relacionamento já reconhecido e ativo, a Entidade central do domínio, à qual todo
 * Opportunity, Activity e Timeline eventualmente se conecta.
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 *
 * `name`/`email`/`phone` foram portados de `src/app/features/crm/types/Client.ts` (papel
 * "customer" daquele tipo dual-purpose) e de `src/core/crm/Customer.ts` — em ambas as árvores
 * legadas, um Customer sem nome ou contato não é operacionalmente útil (IMP-002, CRM Core).
 */
export interface Customer {
  /** Identificador do Customer. */
  readonly customerId: string;

  /** Tenant ao qual o Customer pertence. */
  readonly tenantId: string;

  /** Relationship que estrutura este Customer — ver Relationship.ts. */
  readonly relationshipId: string;

  /** Nome do Customer — pessoa ou razão social, conforme o contexto de captura. */
  readonly name: string;

  /** E-mail de contato, quando informado. */
  readonly email?: string;

  /** Telefone de contato, quando informado. */
  readonly phone?: string;

  /** Momento de criação, por conversão de Lead ou por cadastro direto. */
  readonly createdAt: Date;
}
