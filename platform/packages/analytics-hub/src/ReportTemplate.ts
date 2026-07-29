/**
 * Report Template — define a estrutura reutilizável de um Report.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 4.
 */
export interface ReportTemplate {
  /** Identificador do Report Template. */
  readonly reportTemplateId: string;

  /** Tenant ao qual este Template pertence. */
  readonly tenantId: string;

  /** Nome do Template. */
  readonly name: string;
}
