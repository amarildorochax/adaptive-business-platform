/**
 * Analytics Hub Component — os trinta e dois componentes internos do Analytics Hub, organizados em
 * sete categorias funcionais — contagem confirmada sem discrepância entre a enumeração individual do
 * Capítulo 7 e a afirmação em prosa ("Os trinta e dois componentes... sete categorias funcionais").
 * Estrutura definida em `ANALYTICS_HUB.md`, Capítulo 7.
 */
export type AnalyticsHubComponent =
  // Orquestração
  | "Analytics Manager"
  | "Query Coordinator"
  // Apresentação
  | "Dashboard Manager"
  | "Widget Manager"
  | "Report Manager"
  | "Visualization Manager"
  // Medição
  | "Metric Manager"
  | "KPI Manager"
  | "Aggregation Manager"
  | "Dataset Manager"
  // Histórico
  | "Snapshot Manager"
  | "Time Series Manager"
  | "Trend Manager"
  // Projeção e Inteligência
  | "Forecast Manager"
  | "Insight Manager"
  | "Recommendation Manager"
  | "Analytical Model Manager"
  // Comparação e Indicadores
  | "Benchmark Manager"
  | "Scorecard Manager"
  | "Business Indicator Manager"
  | "Executive Indicator Manager"
  | "Operational Indicator Manager"
  | "Strategic Indicator Manager"
  | "Decision Support Manager"
  // Suporte Transversal
  | "Search Manager"
  | "History Manager"
  | "Configuration Manager"
  | "Audit Manager"
  | "Event Publisher"
  | "Reporting Adapter"
  | "Lifecycle Coordinator"
  | "Notification Publisher";
