import { describe, expect, it } from "vitest";
import { createTestDatabase } from "../../testing/createTestDatabase.js";
import { SqliteContactRepository } from "./SqliteContactRepository.js";
import { SqliteCustomerRepository } from "./SqliteCustomerRepository.js";
import { SqliteLeadRepository } from "./SqliteLeadRepository.js";
import { SqliteOpportunityRepository } from "./SqliteOpportunityRepository.js";
import { SqliteOrganizationRepository } from "./SqliteOrganizationRepository.js";
import { SqliteRelationshipRepository } from "./SqliteRelationshipRepository.js";
import { SqliteTimelineEventRepository } from "./SqliteTimelineEventRepository.js";

describe("SqliteLeadRepository", () => {
  it("cria, recupera por id, lista por tenant e atualiza (qualifiedAt) um Lead real", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteLeadRepository(handle.db);

    const lead = await repository.create({ leadId: "lead-1", tenantId: "tenant-1", name: "Ana Ferreira", email: "ana@example.com", source: "Indicação", createdAt: new Date() });
    expect(await repository.get("lead-1")).toEqual(lead);
    expect(await repository.list("tenant-1")).toHaveLength(1);

    const qualifiedAt = new Date();
    const updated = await repository.update({ ...lead, qualifiedAt });
    expect((await repository.get("lead-1"))?.qualifiedAt).toEqual(qualifiedAt);
    expect(updated.qualifiedAt).toEqual(qualifiedAt);
    handle.close();
  });
});

describe("SqliteCustomerRepository", () => {
  it("cria, atualiza e recupera um Customer real, preservando campo opcional ausente", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteCustomerRepository(handle.db);

    const customer = await repository.create({ customerId: "customer-1", tenantId: "tenant-1", relationshipId: "relationship-1", name: "Floricultura Bela Vista", createdAt: new Date() });
    expect((await repository.get("customer-1"))?.email).toBeUndefined();

    const updated = await repository.update({ ...customer, email: "contato@belavista.example" });
    expect(updated.email).toBe("contato@belavista.example");
    expect((await repository.get("customer-1"))?.email).toBe("contato@belavista.example");
    handle.close();
  });
});

describe("SqliteOrganizationRepository", () => {
  it("persiste todos os campos opcionais e os atualiza corretamente", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteOrganizationRepository(handle.db);

    const organization = await repository.create({
      organizationId: "organization-1",
      tenantId: "tenant-1",
      relationshipId: "relationship-1",
      name: "Floricultura Bela Vista",
      tradeName: "Bela Vista",
      taxId: "12.345.678/0001-90",
      createdAt: new Date(),
    });

    const updated = await repository.update({ ...organization, website: "https://belavista.example" });
    const found = await repository.get("organization-1");

    expect(updated.website).toBe("https://belavista.example");
    expect(found?.tradeName).toBe("Bela Vista");
    expect(found?.website).toBe("https://belavista.example");
    handle.close();
  });
});

describe("SqliteContactRepository", () => {
  it("cria e lista Contact por tenant — sem update, per o contrato (imutável após criação)", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteContactRepository(handle.db);

    await repository.create({ contactId: "contact-1", tenantId: "tenant-1", name: "João Silva", associationType: "Organization", associationId: "organization-1", createdAt: new Date() });

    expect(await repository.list("tenant-1")).toHaveLength(1);
    expect((repository as unknown as Record<string, unknown>).update).toBeUndefined();
    handle.close();
  });
});

describe("SqliteRelationshipRepository", () => {
  it("cria e atualiza status/lifecycleStage de um Relationship real", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteRelationshipRepository(handle.db);

    const relationship = await repository.create({
      relationshipId: "relationship-1",
      tenantId: "tenant-1",
      partyType: "Organization",
      partyId: "organization-1",
      status: "Active",
      lifecycleStage: "New",
      accountManagerId: "identity-1",
      createdAt: new Date(),
    });

    await repository.update({ ...relationship, lifecycleStage: "AtRisk" });
    expect((await repository.get("relationship-1"))?.lifecycleStage).toBe("AtRisk");
    handle.close();
  });
});

describe("SqliteOpportunityRepository", () => {
  it("cria, lista por relationship, e atualiza outcome/closedAt (o mesmo caminho de CRMManager.moveOpportunity)", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteOpportunityRepository(handle.db);

    const opportunity = await repository.create({
      opportunityId: "opportunity-1",
      tenantId: "tenant-1",
      title: "Contrato anual",
      value: 48000,
      relationshipId: "relationship-1",
      pipelineId: "pipeline-padrao",
      stageId: "stage-qualificacao",
      outcome: "Open",
      createdAt: new Date(),
    });

    expect(await repository.listByRelationship("relationship-1")).toHaveLength(1);

    const closedAt = new Date();
    const updated = await repository.update({ ...opportunity, outcome: "Won", closedAt });

    expect(updated.outcome).toBe("Won");
    expect((await repository.get("opportunity-1"))?.closedAt).toEqual(closedAt);
    handle.close();
  });
});

describe("SqliteTimelineEventRepository", () => {
  it("registra Timeline Event imutável, recuperável por relationship — sem update nem remove (ADR-006)", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteTimelineEventRepository(handle.db);

    await repository.add({ timelineEventId: "event-1", tenantId: "tenant-1", relationshipId: "relationship-1", description: "Opportunity criada.", occurredAt: new Date() });

    const events = await repository.listByRelationship("relationship-1");
    expect(events).toHaveLength(1);
    expect((repository as unknown as Record<string, unknown>).update).toBeUndefined();
    expect((repository as unknown as Record<string, unknown>).remove).toBeUndefined();
    handle.close();
  });
});
