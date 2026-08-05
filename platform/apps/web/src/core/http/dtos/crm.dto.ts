/** DTOs do contrato HTTP de CRM — espelham exatamente `apps/api/src/dtos/crm.dto.ts` (FUN-004). */

export interface CreateLeadRequestDto {
  readonly tenantId: string;
  readonly name: string;
  readonly email?: string;
  readonly phone?: string;
  readonly source: string;
}

export interface LeadResponseDto {
  readonly leadId: string;
  readonly tenantId: string;
  readonly name: string;
  readonly email?: string;
  readonly phone?: string;
  readonly source: string;
  readonly qualifiedAt?: string;
  readonly createdAt: string;
}

export interface ConvertLeadRequestDto {
  readonly accountManagerId: string;
}

export interface CreateCustomerRequestDto {
  readonly tenantId: string;
  readonly name: string;
  readonly email?: string;
  readonly phone?: string;
  readonly accountManagerId: string;
}

export interface UpdateCustomerRequestDto {
  readonly name?: string;
  readonly email?: string;
  readonly phone?: string;
}

export interface CustomerResponseDto {
  readonly customerId: string;
  readonly tenantId: string;
  readonly relationshipId: string;
  readonly name: string;
  readonly email?: string;
  readonly phone?: string;
  readonly createdAt: string;
}

export interface CreateOrganizationRequestDto {
  readonly tenantId: string;
  readonly name: string;
  readonly tradeName?: string;
  readonly taxId?: string;
  readonly segment?: string;
  readonly phone?: string;
  readonly email?: string;
  readonly website?: string;
  readonly accountManagerId: string;
}

export interface OrganizationResponseDto {
  readonly organizationId: string;
  readonly tenantId: string;
  readonly relationshipId: string;
  readonly name: string;
  readonly tradeName?: string;
  readonly taxId?: string;
  readonly segment?: string;
  readonly phone?: string;
  readonly email?: string;
  readonly website?: string;
  readonly createdAt: string;
}

export interface RelationshipResponseDto {
  readonly relationshipId: string;
  readonly tenantId: string;
  readonly partyType: string;
  readonly partyId: string;
  readonly status: string;
  readonly lifecycleStage: string;
  readonly accountManagerId: string;
  readonly createdAt: string;
}

export interface CreateContactRequestDto {
  readonly tenantId: string;
  readonly name: string;
  readonly role?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly associationType: "Customer" | "Organization";
  readonly associationId: string;
}

export interface ContactResponseDto {
  readonly contactId: string;
  readonly tenantId: string;
  readonly name: string;
  readonly role?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly associationType: string;
  readonly associationId: string;
  readonly createdAt: string;
}

export interface CreateOpportunityRequestDto {
  readonly tenantId: string;
  readonly title: string;
  readonly value: number;
  readonly relationshipId: string;
  readonly pipelineId: string;
  readonly stageId: string;
  readonly partnerId?: string;
}

export interface MoveOpportunityRequestDto {
  readonly stageId: string;
  readonly outcome?: "Open" | "Won" | "Lost";
  readonly lostReason?: string;
}

export interface OpportunityResponseDto {
  readonly opportunityId: string;
  readonly tenantId: string;
  readonly title: string;
  readonly value: number;
  readonly relationshipId: string;
  readonly pipelineId: string;
  readonly stageId: string;
  readonly partnerId?: string;
  readonly outcome: string;
  readonly lostReason?: string;
  readonly createdAt: string;
  readonly closedAt?: string;
}
