import type { Contact, Customer, Lead, Opportunity, Organization, Relationship } from "@abp/crm-hub";
import type { ContactResponseDto, CustomerResponseDto, LeadResponseDto, OpportunityResponseDto, OrganizationResponseDto, RelationshipResponseDto } from "../dtos/crm.dto.js";

export function toLeadResponseDto(lead: Lead): LeadResponseDto {
  return {
    leadId: lead.leadId,
    tenantId: lead.tenantId,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    qualifiedAt: lead.qualifiedAt?.toISOString(),
    createdAt: lead.createdAt.toISOString(),
  };
}

export function toCustomerResponseDto(customer: Customer): CustomerResponseDto {
  return {
    customerId: customer.customerId,
    tenantId: customer.tenantId,
    relationshipId: customer.relationshipId,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    createdAt: customer.createdAt.toISOString(),
  };
}

export function toOrganizationResponseDto(organization: Organization): OrganizationResponseDto {
  return {
    organizationId: organization.organizationId,
    tenantId: organization.tenantId,
    relationshipId: organization.relationshipId,
    name: organization.name,
    tradeName: organization.tradeName,
    taxId: organization.taxId,
    segment: organization.segment,
    phone: organization.phone,
    email: organization.email,
    website: organization.website,
    createdAt: organization.createdAt.toISOString(),
  };
}

export function toRelationshipResponseDto(relationship: Relationship): RelationshipResponseDto {
  return {
    relationshipId: relationship.relationshipId,
    tenantId: relationship.tenantId,
    partyType: relationship.partyType,
    partyId: relationship.partyId,
    status: relationship.status,
    lifecycleStage: relationship.lifecycleStage,
    accountManagerId: relationship.accountManagerId,
    createdAt: relationship.createdAt.toISOString(),
  };
}

export function toContactResponseDto(contact: Contact): ContactResponseDto {
  return {
    contactId: contact.contactId,
    tenantId: contact.tenantId,
    name: contact.name,
    role: contact.role,
    email: contact.email,
    phone: contact.phone,
    associationType: contact.associationType,
    associationId: contact.associationId,
    createdAt: contact.createdAt.toISOString(),
  };
}

export function toOpportunityResponseDto(opportunity: Opportunity): OpportunityResponseDto {
  return {
    opportunityId: opportunity.opportunityId,
    tenantId: opportunity.tenantId,
    title: opportunity.title,
    value: opportunity.value,
    relationshipId: opportunity.relationshipId,
    pipelineId: opportunity.pipelineId,
    stageId: opportunity.stageId,
    partnerId: opportunity.partnerId,
    outcome: opportunity.outcome,
    lostReason: opportunity.lostReason,
    createdAt: opportunity.createdAt.toISOString(),
    closedAt: opportunity.closedAt?.toISOString(),
  };
}
