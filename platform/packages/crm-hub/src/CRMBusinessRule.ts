/**
 * CRM Business Rule — o catálogo declarativo das doze Regras de negócio do domínio CRM, verificadas
 * pelo Validation Engine antes de qualquer mudança de estado (Validation at the Boundary). Este
 * artefato registra o catálogo, nunca a lógica de verificação — a verificação em si é responsabilidade
 * de implementação futura do Validation Engine, fora do escopo puramente declarativo desta Sprint.
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 12.
 */
export type CRMBusinessRuleId =
  | "CustomerRequiresRelationship"
  | "LeadConversionIsNotGuaranteed"
  | "OpportunityBelongsToCustomerOrOrganization"
  | "TimelineNeverDeleted"
  | "ConsentIsVersioned"
  | "SupplierIsNotAutomaticallyCustomer"
  | "PartnerOpportunitiesBelongToFinalCustomer"
  | "OwnershipIsUnique"
  | "StageChangeProducesTimelineEvent"
  | "LeadRegisteredBeforeDeduplication"
  | "ContactAssociatesToOneCustomerOrOrganization"
  | "ActivityAndTaskRequireRelationship";

export interface CRMBusinessRule {
  /** Identificador da Regra. */
  readonly ruleId: CRMBusinessRuleId;

  /** Descrição da Regra, conforme já fixada em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 12. */
  readonly description: string;
}
