/**
 * Relationship — o vínculo estrutural que conecta a Empresa a qualquer parte externa (Customer,
 * Organization, Supplier, Partner), carregando Status, Lifecycle Stage e Ownership independentemente
 * de qual tipo de parte externa ele conecta.
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulos 7 e 8.
 */
export type RelationshipPartyType = "Customer" | "Organization" | "Supplier" | "Partner";

/** Estado operacional imediato de um Relationship — "ativo, inativo, arquivado" (Blueprint, Capítulo 7). */
export type RelationshipStatus = "Active" | "Inactive" | "Archived";

/** Estágio de maturidade de um Relationship — "por exemplo, novo, ativo, em risco, recuperado" (Blueprint, Capítulo 7). */
export type RelationshipLifecycleStage = "New" | "Active" | "AtRisk" | "Recovered";

export interface Relationship {
  /** Identificador do Relationship. */
  readonly relationshipId: string;

  /** Tenant ao qual o Relationship pertence — isolamento absoluto entre Empresas. */
  readonly tenantId: string;

  /** Natureza da parte externa conectada. */
  readonly partyType: RelationshipPartyType;

  /** Identificador opaco de Customer, Organization, Supplier ou Partner, conforme partyType. */
  readonly partyId: string;

  /** Estado operacional imediato. */
  readonly status: RelationshipStatus;

  /** Estágio de maturidade do relacionamento. */
  readonly lifecycleStage: RelationshipLifecycleStage;

  /** Ownership — identificador opaco do Account Manager responsável, sempre único (Blueprint, Capítulo 12). */
  readonly accountManagerId: string;

  /** Momento de criação do Relationship. */
  readonly createdAt: Date;
}
