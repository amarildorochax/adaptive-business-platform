/**
 * Lead — relacionamento em estágio inicial, capturado por qualquer canal, ainda não confirmado como
 * Customer; acumula sinal suficiente para que uma decisão de Qualificação seja tomada.
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Lead {
  /** Identificador do Lead. */
  readonly leadId: string;

  /** Tenant ao qual o Lead pertence. */
  readonly tenantId: string;

  /** Canal de origem da captura. */
  readonly source: string;

  /** Momento em que o Lead atendeu ao critério mínimo de conversão, quando já qualificado. */
  readonly qualifiedAt?: Date;

  /** Momento da captura. */
  readonly createdAt: Date;
}
