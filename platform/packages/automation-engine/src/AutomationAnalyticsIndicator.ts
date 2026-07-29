/**
 * Automation Analytics Indicator — o dado agregado pelo Metrics Engine transformado em indicador
 * consultável de negócio (ex.: quantos Leads foram processados por automação, taxa de conversão de
 * um Fluxo de reengajamento), consumido pelo Analytics Hub (`AUTOMATION_ENGINE.md`, Capítulo 7).
 * Nenhum tipo de `@abp/analytics-hub` é importado por este arquivo — o consumo pelo Analytics Hub
 * acontece, quando implementado, exclusivamente por Evento público, mesma disciplina já exigida de
 * todo Business Hub na Phase 5.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export interface AutomationAnalyticsIndicator {
  /** Identificador do indicador. */
  readonly automationAnalyticsIndicatorId: string;

  /** Descrição do indicador de negócio. */
  readonly description: string;

  /** Valor consolidado. */
  readonly value: number;

  /** Momento do cálculo. */
  readonly calculatedAt: Date;
}
