import { describe, expect, it } from "vitest";
import { buildTestServer } from "../testing/buildTestServer.js";

describe("Rotas HTTP do Supplier Hub", () => {
  it("fluxo completo via HTTP real: registerSupplier -> getSupplier -> listActiveSuppliers -> updateSupplier -> disable -> reactivate -> addContact", async () => {
    const fastify = await buildTestServer();

    const registered = await fastify.inject({
      method: "POST",
      url: "/suppliers",
      payload: { tenantId: "tenant-1", legalName: "Floricultura Atacado Ltda.", taxId: "12345678000199", supplyCategory: "Flores" },
    });
    expect(registered.statusCode).toBe(201);
    const supplier = registered.json() as { supplierId: string; status: string; taxId: string };
    expect(supplier.status).toBe("Active");
    expect(supplier.taxId).toBe("12345678000199");

    const found = await fastify.inject({ method: "GET", url: `/suppliers/${supplier.supplierId}` });
    expect(found.statusCode).toBe(200);
    expect((found.json() as { legalName: string }).legalName).toBe("Floricultura Atacado Ltda.");

    const listed = await fastify.inject({ method: "GET", url: "/suppliers/by-tenant/tenant-1" });
    expect(listed.statusCode).toBe(200);
    expect(listed.json()).toHaveLength(1);

    const updated = await fastify.inject({
      method: "PATCH",
      url: `/suppliers/${supplier.supplierId}`,
      payload: { legalName: "Floricultura Atacado S.A." },
    });
    expect(updated.statusCode).toBe(200);
    expect((updated.json() as { legalName: string }).legalName).toBe("Floricultura Atacado S.A.");

    const disabled = await fastify.inject({ method: "POST", url: `/suppliers/${supplier.supplierId}/disable` });
    expect(disabled.statusCode).toBe(200);
    expect((disabled.json() as { status: string }).status).toBe("Disabled");

    const reactivated = await fastify.inject({ method: "POST", url: `/suppliers/${supplier.supplierId}/reactivate` });
    expect(reactivated.statusCode).toBe(200);
    expect((reactivated.json() as { status: string }).status).toBe("Active");

    const withContact = await fastify.inject({
      method: "POST",
      url: `/suppliers/${supplier.supplierId}/contacts`,
      payload: { name: "Maria Souza", role: "Commercial" },
    });
    expect(withContact.statusCode).toBe(201);
    expect((withContact.json() as { contacts: unknown[] }).contacts).toHaveLength(1);

    await fastify.close();
  });

  it("fluxo completo de Catalog Item, Contract e Performance Record via HTTP real", async () => {
    const fastify = await buildTestServer();

    const registered = await fastify.inject({
      method: "POST",
      url: "/suppliers",
      payload: { tenantId: "tenant-1", legalName: "Fornecedor de Insumos", taxId: "12345678000199" },
    });
    const supplier = registered.json() as { supplierId: string };

    const item = await fastify.inject({
      method: "POST",
      url: "/supplier-catalog-items",
      payload: {
        supplierId: supplier.supplierId,
        tenantId: "tenant-1",
        productId: "product-1",
        listPrice: { amount: 19.9, currencyCode: "BRL" },
        leadTimeInDays: 5,
        minimumOrderQuantity: 10,
      },
    });
    expect(item.statusCode).toBe(201);
    const itemBody = item.json() as { catalogItemId: string; listPrice: { amount: number } };
    expect(itemBody.listPrice.amount).toBe(19.9);

    const updatedItem = await fastify.inject({
      method: "PATCH",
      url: `/supplier-catalog-items/${itemBody.catalogItemId}`,
      payload: { listPrice: { amount: 21.5, currencyCode: "BRL" } },
    });
    expect(updatedItem.statusCode).toBe(200);
    expect((updatedItem.json() as { listPrice: { amount: number } }).listPrice.amount).toBe(21.5);

    const contract = await fastify.inject({
      method: "POST",
      url: "/supplier-contracts",
      payload: {
        supplierId: supplier.supplierId,
        tenantId: "tenant-1",
        startsAt: "2026-01-01T00:00:00.000Z",
        paymentTermsDueInDays: 30,
      },
    });
    expect(contract.statusCode).toBe(201);
    expect((contract.json() as { paymentTermsDueInDays: number }).paymentTermsDueInDays).toBe(30);

    const performance = await fastify.inject({
      method: "POST",
      url: "/supplier-performance-records",
      payload: {
        supplierId: supplier.supplierId,
        tenantId: "tenant-1",
        purchaseOrderId: "po-1",
        promisedAt: "2026-01-10T00:00:00.000Z",
        receivedAt: "2026-01-09T00:00:00.000Z",
        quantityOrdered: 100,
        quantityReceived: 100,
      },
    });
    expect(performance.statusCode).toBe(201);
    const records = performance.json() as { observationType: string }[];
    expect(records.map((r) => r.observationType)).toEqual(["OnTimeDelivery", "QuantityMatch"]);

    await fastify.close();
  });

  it("400 — registrar Supplier sem 'taxId' (obrigatório) é rejeitado pela validação de schema", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "POST", url: "/suppliers", payload: { tenantId: "tenant-1", legalName: "Sem TaxId" } });

    expect(response.statusCode).toBe(400);
    await fastify.close();
  });

  it("404 — buscar um Supplier inexistente", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "GET", url: "/suppliers/supplier-inexistente" });

    expect(response.statusCode).toBe(404);
    await fastify.close();
  });

  it("404 — desabilitar um Supplier inexistente", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "POST", url: "/suppliers/supplier-inexistente/disable" });

    expect(response.statusCode).toBe(404);
    await fastify.close();
  });

  it("409 — registrar dois Supplier com o mesmo taxId no mesmo Tenant", async () => {
    const fastify = await buildTestServer();

    await fastify.inject({ method: "POST", url: "/suppliers", payload: { tenantId: "tenant-1", legalName: "Primeiro", taxId: "12345678000199" } });
    const response = await fastify.inject({ method: "POST", url: "/suppliers", payload: { tenantId: "tenant-1", legalName: "Segundo", taxId: "12345678000199" } });

    expect(response.statusCode).toBe(409);
    await fastify.close();
  });

  it("409 — desabilitar um Supplier já desabilitado (transição de status inválida)", async () => {
    const fastify = await buildTestServer();

    const registered = await fastify.inject({ method: "POST", url: "/suppliers", payload: { tenantId: "tenant-1", legalName: "Fornecedor", taxId: "12345678000199" } });
    const supplier = registered.json() as { supplierId: string };
    await fastify.inject({ method: "POST", url: `/suppliers/${supplier.supplierId}/disable` });

    const response = await fastify.inject({ method: "POST", url: `/suppliers/${supplier.supplierId}/disable` });

    expect(response.statusCode).toBe(409);
    await fastify.close();
  });

  it("422 — registrar Supplier com taxId em formato inválido", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "POST", url: "/suppliers", payload: { tenantId: "tenant-1", legalName: "Fornecedor Inválido", taxId: "123" } });

    expect(response.statusCode).toBe(422);
    await fastify.close();
  });

  it("422 — registrar Catalog Item com Money inválido (valor negativo)", async () => {
    const fastify = await buildTestServer();

    const registered = await fastify.inject({ method: "POST", url: "/suppliers", payload: { tenantId: "tenant-1", legalName: "Fornecedor", taxId: "12345678000199" } });
    const supplier = registered.json() as { supplierId: string };

    const response = await fastify.inject({
      method: "POST",
      url: "/supplier-catalog-items",
      payload: {
        supplierId: supplier.supplierId,
        tenantId: "tenant-1",
        productId: "product-1",
        listPrice: { amount: -1, currencyCode: "BRL" },
        leadTimeInDays: 5,
        minimumOrderQuantity: 10,
      },
    });

    expect(response.statusCode).toBe(422);
    await fastify.close();
  });

  it("dado criado via HTTP sobrevive à consulta subsequente sobre a mesma conexão SQLite (sem mocks)", async () => {
    const fastify = await buildTestServer();

    const registered = await fastify.inject({ method: "POST", url: "/suppliers", payload: { tenantId: "tenant-1", legalName: "Persistido de Verdade", taxId: "12345678000199" } });
    const supplier = registered.json() as { supplierId: string };

    const found = await fastify.inject({ method: "GET", url: `/suppliers/${supplier.supplierId}` });
    expect((found.json() as { legalName: string }).legalName).toBe("Persistido de Verdade");

    await fastify.close();
  });
});

describe("Documentação OpenAPI — Supplier Hub", () => {
  it("expõe os endpoints /suppliers e /supplier-* com a tag 'supplier'", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "GET", url: "/documentation/json" });
    expect(response.statusCode).toBe(200);

    const doc = response.json() as { paths: Record<string, unknown>; tags: { name: string }[] };
    expect(doc.tags.map((tag) => tag.name)).toContain("supplier");
    expect(Object.keys(doc.paths)).toEqual(
      expect.arrayContaining([
        "/suppliers",
        "/suppliers/{supplierId}",
        "/suppliers/by-tenant/{tenantId}",
        "/suppliers/{supplierId}/disable",
        "/suppliers/{supplierId}/reactivate",
        "/suppliers/{supplierId}/contacts",
        "/supplier-catalog-items",
        "/supplier-catalog-items/{catalogItemId}",
        "/supplier-contracts",
        "/supplier-performance-records",
      ]),
    );

    await fastify.close();
  });
});
