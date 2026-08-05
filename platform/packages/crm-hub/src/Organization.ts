/**
 * Organization — entidade coletiva, tipicamente uma empresa-cliente, distinta de um Customer
 * individual, permitindo que múltiplos Contact se relacionem com a mesma Organization.
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 *
 * Os campos de negócio abaixo (`name` em diante) não constam da forma mínima já declarada pelo
 * Blueprint — foram portados de `src/app/features/crm/types/Company.ts` (IMP-002, CRM Core), a
 * implementação mais madura já validada em UI real, sem que isso redefina o conceito já Frozen:
 * Organization continua a mesma Entidade, apenas com sua forma concreta elaborada.
 */
export interface Organization {
  /** Identificador da Organization. */
  readonly organizationId: string;

  /** Tenant ao qual a Organization pertence. */
  readonly tenantId: string;

  /** Relationship que estrutura esta Organization — ver Relationship.ts. */
  readonly relationshipId: string;

  /** Razão social ou nome de fantasia pelo qual a Organization é conhecida. */
  readonly name: string;

  /** Nome fantasia, quando distinto de `name`. Portado de `Company.tradeName`. */
  readonly tradeName?: string;

  /** Identificador fiscal (CNPJ ou equivalente), quando aplicável. */
  readonly taxId?: string;

  /** Segmento de atuação declarado, quando conhecido. */
  readonly segment?: string;

  /** Telefone de contato principal. */
  readonly phone?: string;

  /** E-mail de contato principal. */
  readonly email?: string;

  /** Sítio eletrônico, quando informado. */
  readonly website?: string;

  /** Momento de criação. */
  readonly createdAt: Date;
}
