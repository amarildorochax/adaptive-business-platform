/**
 * Activity — ação já realizada como parte de um relacionamento, registrada de forma factual, sempre
 * em passado, nunca como intenção futura; associada a exatamente um Relationship (Blueprint,
 * Capítulo 12).
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Activity {
  /** Identificador da Activity. */
  readonly activityId: string;

  /** Tenant ao qual a Activity pertence. */
  readonly tenantId: string;

  /** Relationship ao qual esta Activity está associada. */
  readonly relationshipId: string;

  /** Descrição factual da ação já realizada. */
  readonly description: string;

  /** Momento em que a ação ocorreu. */
  readonly occurredAt: Date;
}
