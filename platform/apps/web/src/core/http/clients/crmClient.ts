import { apiClient } from "../client.js";
import type {
  ContactResponseDto,
  ConvertLeadRequestDto,
  CreateContactRequestDto,
  CreateCustomerRequestDto,
  CreateLeadRequestDto,
  CreateOpportunityRequestDto,
  CreateOrganizationRequestDto,
  CustomerResponseDto,
  LeadResponseDto,
  MoveOpportunityRequestDto,
  OpportunityResponseDto,
  OrganizationResponseDto,
  RelationshipResponseDto,
  UpdateCustomerRequestDto,
} from "../dtos/crm.dto.js";

/** Cliente HTTP de CRM — espelha `apps/api/src/routes/crm.ts` (FUN-004), rota a rota. */
export const crmClient = {
  createLead(payload: CreateLeadRequestDto): Promise<LeadResponseDto> {
    return apiClient.post("/crm/leads", payload);
  },

  convertLead(leadId: string, payload: ConvertLeadRequestDto): Promise<{ readonly customer: CustomerResponseDto; readonly relationship: RelationshipResponseDto }> {
    return apiClient.post(`/crm/leads/${encodeURIComponent(leadId)}/convert`, payload);
  },

  createCustomer(payload: CreateCustomerRequestDto): Promise<{ readonly customer: CustomerResponseDto; readonly relationship: RelationshipResponseDto }> {
    return apiClient.post("/crm/customers", payload);
  },

  updateCustomer(customerId: string, payload: UpdateCustomerRequestDto): Promise<CustomerResponseDto> {
    return apiClient.patch(`/crm/customers/${encodeURIComponent(customerId)}`, payload);
  },

  createOrganization(payload: CreateOrganizationRequestDto): Promise<{ readonly organization: OrganizationResponseDto; readonly relationship: RelationshipResponseDto }> {
    return apiClient.post("/crm/organizations", payload);
  },

  createContact(payload: CreateContactRequestDto): Promise<ContactResponseDto> {
    return apiClient.post("/crm/contacts", payload);
  },

  createOpportunity(payload: CreateOpportunityRequestDto): Promise<OpportunityResponseDto> {
    return apiClient.post("/crm/opportunities", payload);
  },

  moveOpportunity(opportunityId: string, payload: MoveOpportunityRequestDto): Promise<OpportunityResponseDto> {
    return apiClient.post(`/crm/opportunities/${encodeURIComponent(opportunityId)}/move`, payload);
  },
};
