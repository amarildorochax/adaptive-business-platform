/**
 * CRM Query — as nove Consultas de leitura do CRM Hub, cada uma resolvida contra um Read Model já
 * materializado, nunca reconstruída a partir de varredura do armazenamento transacional primário.
 * Estrutura definida em `CRM_HUB.md`, Capítulo 11.
 */
export type CRMQueryType =
  | "Customer360"
  | "Timeline"
  | "OpenOpportunities"
  | "ActiveLeads"
  | "PipelineSummary"
  | "SegmentSearch"
  | "CustomerHistory"
  | "ActivityHistory"
  | "RelationshipView";

export interface CRMQuery {
  /** Identificador da Query. */
  readonly queryId: string;

  /** Tipo da Query. */
  readonly type: CRMQueryType;

  /** Momento em que a Query foi solicitada. */
  readonly requestedAt: Date;
}
