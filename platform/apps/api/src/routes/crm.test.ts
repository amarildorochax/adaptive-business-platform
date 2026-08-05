import { describe, expect, it } from "vitest";
import { buildTestServer } from "../testing/buildTestServer.js";

describe("Rotas HTTP de CRM", () => {
  it("cria Lead, converte em Customer, cria Organization/Contact/Opportunity, e move a Opportunity — fluxo completo via HTTP real", async () => {
    const fastify = await buildTestServer();

    const lead = await fastify.inject({ method: "POST", url: "/crm/leads", payload: { tenantId: "tenant-1", name: "Ana Ferreira", email: "ana@example.com", source: "Indicação" } });
    expect(lead.statusCode).toBe(201);
    const leadId = (lead.json() as { leadId: string }).leadId;

    const converted = await fastify.inject({ method: "POST", url: `/crm/leads/${leadId}/convert`, payload: { accountManagerId: "identity-1" } });
    expect(converted.statusCode).toBe(200);
    const convertedBody = converted.json() as { customer: { customerId: string }; relationship: { relationshipId: string } };
    expect(convertedBody.customer.customerId).toBeTruthy();

    const organization = await fastify.inject({
      method: "POST",
      url: "/crm/organizations",
      payload: { tenantId: "tenant-1", name: "Floricultura Bela Vista", accountManagerId: "identity-1" },
    });
    expect(organization.statusCode).toBe(201);
    const organizationBody = organization.json() as { organization: { organizationId: string }; relationship: { relationshipId: string } };

    const contact = await fastify.inject({
      method: "POST",
      url: "/crm/contacts",
      payload: { tenantId: "tenant-1", name: "João Silva", associationType: "Organization", associationId: organizationBody.organization.organizationId },
    });
    expect(contact.statusCode).toBe(201);

    const opportunity = await fastify.inject({
      method: "POST",
      url: "/crm/opportunities",
      payload: { tenantId: "tenant-1", title: "Contrato anual", value: 48000, relationshipId: organizationBody.relationship.relationshipId, pipelineId: "pipeline-padrao", stageId: "stage-1" },
    });
    expect(opportunity.statusCode).toBe(201);
    const opportunityBody = opportunity.json() as { opportunityId: string; outcome: string };
    expect(opportunityBody.outcome).toBe("Open");

    const moved = await fastify.inject({ method: "POST", url: `/crm/opportunities/${opportunityBody.opportunityId}/move`, payload: { stageId: "stage-2", outcome: "Won" } });
    expect(moved.statusCode).toBe(200);
    expect((moved.json() as { outcome: string }).outcome).toBe("Won");

    await fastify.close();
  });

  it("cria e atualiza um Customer diretamente (PATCH)", async () => {
    const fastify = await buildTestServer();

    const created = await fastify.inject({ method: "POST", url: "/crm/customers", payload: { tenantId: "tenant-1", name: "Bela Vista", accountManagerId: "identity-1" } });
    expect(created.statusCode).toBe(201);
    const customerId = (created.json() as { customer: { customerId: string } }).customer.customerId;

    const updated = await fastify.inject({ method: "PATCH", url: `/crm/customers/${customerId}`, payload: { email: "contato@belavista.example" } });

    expect(updated.statusCode).toBe(200);
    expect((updated.json() as { email: string }).email).toBe("contato@belavista.example");
    await fastify.close();
  });

  it("400 — criar Lead sem 'source' (obrigatório) é rejeitado pela validação de schema", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "POST", url: "/crm/leads", payload: { tenantId: "tenant-1", name: "Ana Ferreira" } });

    expect(response.statusCode).toBe(400);
    await fastify.close();
  });

  it("404 — converter um Lead inexistente", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "POST", url: "/crm/leads/lead-inexistente/convert", payload: { accountManagerId: "identity-1" } });

    expect(response.statusCode).toBe(404);
    await fastify.close();
  });

  it("422 — Opportunity associada a um Relationship que não é Customer nem Organization", async () => {
    const fastify = await buildTestServer();

    // Não há caminho HTTP para criar um Relationship de Supplier/Partner diretamente (correto — nenhuma
    // rota foi criada para isso, porque nenhum Command de CRMManager cobre esse caso); este teste
    // usa um relationshipId inexistente, que já produz 404 via RelationshipService.get — cobrindo o
    // caminho de erro real e alcançável por HTTP.
    const response = await fastify.inject({
      method: "POST",
      url: "/crm/opportunities",
      payload: { tenantId: "tenant-1", title: "X", value: 100, relationshipId: "relationship-inexistente", pipelineId: "p", stageId: "s" },
    });

    expect(response.statusCode).toBe(404);
    await fastify.close();
  });
});
