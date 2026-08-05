import { describe, expect, it } from "vitest";
import { toContactResponseDto, toCustomerResponseDto, toLeadResponseDto, toOpportunityResponseDto, toOrganizationResponseDto, toRelationshipResponseDto } from "./crm.mapper.js";

describe("mapeamentos de CRM — Entity → DTO", () => {
  it("toLeadResponseDto preserva qualifiedAt ausente como undefined, presente como ISO 8601", () => {
    const base = { leadId: "lead-1", tenantId: "tenant-1", name: "Ana", source: "Site", createdAt: new Date("2026-07-01T00:00:00.000Z") };
    expect(toLeadResponseDto(base).qualifiedAt).toBeUndefined();
    expect(toLeadResponseDto({ ...base, qualifiedAt: new Date("2026-07-02T00:00:00.000Z") }).qualifiedAt).toBe("2026-07-02T00:00:00.000Z");
  });

  it("toCustomerResponseDto e toOrganizationResponseDto mapeiam campo opcional corretamente", () => {
    expect(
      toCustomerResponseDto({ customerId: "customer-1", tenantId: "tenant-1", relationshipId: "relationship-1", name: "Bela Vista", createdAt: new Date("2026-07-01T00:00:00.000Z") }).email,
    ).toBeUndefined();

    const organization = toOrganizationResponseDto({
      organizationId: "organization-1",
      tenantId: "tenant-1",
      relationshipId: "relationship-1",
      name: "Bela Vista",
      tradeName: "Bela Vista Flores",
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
    });
    expect(organization.tradeName).toBe("Bela Vista Flores");
    expect(organization.taxId).toBeUndefined();
  });

  it("toRelationshipResponseDto e toContactResponseDto mapeiam campo a campo", () => {
    expect(
      toRelationshipResponseDto({
        relationshipId: "relationship-1",
        tenantId: "tenant-1",
        partyType: "Organization",
        partyId: "organization-1",
        status: "Active",
        lifecycleStage: "New",
        accountManagerId: "identity-1",
        createdAt: new Date("2026-07-01T00:00:00.000Z"),
      }).lifecycleStage,
    ).toBe("New");

    expect(
      toContactResponseDto({
        contactId: "contact-1",
        tenantId: "tenant-1",
        name: "João",
        associationType: "Organization",
        associationId: "organization-1",
        createdAt: new Date("2026-07-01T00:00:00.000Z"),
      }).associationType,
    ).toBe("Organization");
  });

  it("toOpportunityResponseDto preserva closedAt ausente como undefined", () => {
    const opportunity = toOpportunityResponseDto({
      opportunityId: "opportunity-1",
      tenantId: "tenant-1",
      title: "Contrato anual",
      value: 48000,
      relationshipId: "relationship-1",
      pipelineId: "pipeline-padrao",
      stageId: "stage-qualificacao",
      outcome: "Open",
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
    });
    expect(opportunity.closedAt).toBeUndefined();
    expect(opportunity.value).toBe(48000);
  });
});
