/**
 * Growth Hub Component — os trinta e dois componentes internos do Growth Hub, organizados em sete
 * categorias funcionais — contagem confirmada sem discrepância entre a enumeração individual do
 * Capítulo 7 e a afirmação em prosa ("Os trinta e dois componentes... sete categorias funcionais").
 * Estrutura definida em `GROWTH_HUB.md`, Capítulo 7.
 */
export type GrowthHubComponent =
  // Orquestração
  | "Growth Manager"
  // Estratégia
  | "Campaign Manager"
  | "Audience Manager"
  | "Segmentation Manager"
  // Jornada
  | "Journey Manager"
  | "Funnel Manager"
  // Experimentação
  | "Experiment Manager"
  | "A/B Test Manager"
  | "Variant Manager"
  // Ciclo de Vida
  | "Acquisition Manager"
  | "Activation Manager"
  | "Retention Manager"
  | "Expansion Manager"
  | "Referral Manager"
  | "Cohort Manager"
  | "Lifecycle Manager"
  | "Engagement Manager"
  // Medição e Inteligência
  | "Attribution Manager"
  | "Growth Metrics Manager"
  | "Growth KPI Manager"
  | "Growth Insight Manager"
  | "Growth Recommendation Manager"
  | "Initiative Manager"
  | "Opportunity Manager"
  // Suporte Transversal
  | "Search Manager"
  | "History Manager"
  | "Configuration Manager"
  | "Audit Manager"
  | "Lifecycle Coordinator"
  | "Event Publisher"
  | "Notification Publisher"
  | "Reporting Adapter";
