/**
 * CRM Event — os dezoito Eventos de domínio publicados pelo CRM Hub, cada um um Fato consumado,
 * nunca uma instrução (Publish Facts, Not Commands), publicados exclusivamente pelo Event Publisher.
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 10.
 */
export type CRMEventType =
  | "LeadCreated"
  | "LeadQualified"
  | "LeadConverted"
  | "CustomerCreated"
  | "CustomerUpdated"
  | "CustomerArchived"
  | "SupplierRegistered"
  | "PartnerRegistered"
  | "OpportunityCreated"
  | "OpportunityWon"
  | "OpportunityLost"
  | "TaskAssigned"
  | "TaskCompleted"
  | "ActivityLogged"
  | "ConsentUpdated"
  | "RelationshipChanged"
  | "SegmentUpdated"
  | "TimelineUpdated";

export interface CRMEvent {
  /** Identificador do Evento. */
  readonly eventId: string;

  /** Tipo do Evento. */
  readonly type: CRMEventType;

  /** Relationship ao qual este Evento se refere, quando aplicável. */
  readonly relationshipId?: string;

  /** Momento em que o Fato ocorreu. */
  readonly occurredAt: Date;
}
