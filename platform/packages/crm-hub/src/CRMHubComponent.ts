/**
 * CRM Hub Component — os trinta e três componentes internos do CRM Hub, organizados em cinco
 * categorias funcionais (Orquestração; Gestão de Entidade; Qualidade e Integridade de Dado; Movimento
 * de Dado; Suporte Transversal), cada um com limite estrito de responsabilidade.
 * Estrutura definida em `CRM_HUB.md`, Capítulo 7.
 */
export type CRMHubComponent =
  // Orquestração
  | "CRM Manager"
  // Gestão de Entidade
  | "Lead Manager"
  | "Customer Manager"
  | "Contact Manager"
  | "Organization Manager"
  | "Supplier Manager"
  | "Partner Manager"
  | "Relationship Manager"
  | "Pipeline Manager"
  | "Opportunity Manager"
  | "Stage Manager"
  | "Activity Manager"
  | "Task Manager"
  | "Timeline Manager"
  | "Consent Manager"
  | "Segment Manager"
  | "Tag Manager"
  | "Custom Field Manager"
  | "Ownership Manager"
  // Qualidade e Integridade de Dado
  | "Validation Engine"
  | "Deduplication Engine"
  | "Merge Engine"
  // Movimento de Dado
  | "Import Manager"
  | "Export Manager"
  | "Search Manager"
  // Suporte Transversal
  | "CRM Analytics"
  | "History Manager"
  | "Audit Manager"
  | "Lifecycle Manager"
  | "Configuration Manager"
  | "Notification Publisher"
  | "Event Publisher"
  | "Reporting Adapter";
