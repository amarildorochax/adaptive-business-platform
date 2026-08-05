/**
 * Lead — relacionamento em estágio inicial, capturado por qualquer canal, ainda não confirmado como
 * Customer; acumula sinal suficiente para que uma decisão de Qualificação seja tomada.
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 *
 * `name`/`email`/`phone` portados do papel "lead" de `Client.ts` (src/app/features/crm) — o mínimo
 * de identificação sem o qual um Lead capturado não é rastreável (IMP-002, CRM Core). Nunca inclui
 * `status` do tipo Customer — per CRM_VOCABULARY_RECONCILIATION.md, Capítulo 12, Lead e Customer
 * permanecem Entidades distintas, nunca um único tipo diferenciado por campo de status.
 */
export interface Lead {
  /** Identificador do Lead. */
  readonly leadId: string;

  /** Tenant ao qual o Lead pertence. */
  readonly tenantId: string;

  /** Nome informado ou capturado na origem. */
  readonly name: string;

  /** E-mail de contato, quando capturado. */
  readonly email?: string;

  /** Telefone de contato, quando capturado. */
  readonly phone?: string;

  /** Canal de origem da captura. */
  readonly source: string;

  /** Momento em que o Lead atendeu ao critério mínimo de conversão, quando já qualificado. */
  readonly qualifiedAt?: Date;

  /** Momento da captura. */
  readonly createdAt: Date;
}
