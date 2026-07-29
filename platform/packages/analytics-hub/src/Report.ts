/**
 * Report — o documento estruturado de leitura analítica gerado a partir de um Report Template já
 * definido, consumindo Dataset e Visualization já consolidados.
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Report {
  /** Identificador do Report. */
  readonly reportId: string;

  /** Tenant ao qual o Report pertence. */
  readonly tenantId: string;

  /** Report Template a partir do qual este Report foi gerado. */
  readonly reportTemplateId: string;

  /** Momento de geração. */
  readonly generatedAt: Date;
}
