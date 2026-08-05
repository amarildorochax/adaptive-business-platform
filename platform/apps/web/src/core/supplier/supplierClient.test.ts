import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../http/ApiError.js";
import { apiClient } from "../http/client.js";
import { supplierClient } from "./supplierClient.js";
import { startRealApiServer, type RealApiServer } from "./testing/realApiServer.js";

/**
 * Integração real do Supplier Hub — nenhum mock de `fetch`, chamada HTTP real contra uma instância
 * real de `apps/api` (Fastify + SQLite `:memory:`), per instrução explícita de IMP-204. Servidor
 * novo por teste (`beforeEach`/`afterEach`), garantindo isolamento total de dado entre casos —
 * mesma disciplina já usada por `SqliteRepositories.test.ts` (IMP-202) e `crm.test.ts` (IMP-203).
 */
describe("supplierClient — integração HTTP real (sem mock)", () => {
  let server: RealApiServer;

  beforeEach(async () => {
    server = await startRealApiServer();
  });

  afterEach(async () => {
    await server.close();
  });

  it("register -> findById -> listByTenant -> update -> disable -> reactivate -> addContact, fim a fim contra o servidor real", async () => {
    const registered = await supplierClient.register({ tenantId: "tenant-1", legalName: "Floricultura Atacado Ltda.", taxId: "12345678000199" });
    expect(registered.status).toBe("Active");

    const found = await supplierClient.findById(registered.supplierId);
    expect(found?.legalName).toBe("Floricultura Atacado Ltda.");

    const listed = await supplierClient.listByTenant("tenant-1");
    expect(listed).toHaveLength(1);

    const updated = await supplierClient.update(registered.supplierId, { legalName: "Floricultura Atacado S.A." });
    expect(updated.legalName).toBe("Floricultura Atacado S.A.");

    const disabled = await supplierClient.disable(registered.supplierId);
    expect(disabled.status).toBe("Disabled");

    const reactivated = await supplierClient.reactivate(registered.supplierId);
    expect(reactivated.status).toBe("Active");

    const withContact = await supplierClient.addContact(registered.supplierId, { name: "Maria Souza", role: "Commercial" });
    expect(withContact.contacts).toHaveLength(1);
  });

  it("registerCatalogItem -> updateCatalogItem -> createContract -> recordPerformance, fim a fim contra o servidor real", async () => {
    const supplier = await supplierClient.register({ tenantId: "tenant-1", legalName: "Fornecedor de Insumos", taxId: "12345678000199" });

    const item = await supplierClient.registerCatalogItem({
      supplierId: supplier.supplierId,
      tenantId: "tenant-1",
      productId: "product-1",
      listPrice: { amount: 19.9, currencyCode: "BRL" },
      leadTimeInDays: 5,
      minimumOrderQuantity: 10,
    });
    expect(item.listPrice.amount).toBe(19.9);

    const updatedItem = await supplierClient.updateCatalogItem(item.catalogItemId, { listPrice: { amount: 21.5, currencyCode: "BRL" } });
    expect(updatedItem.listPrice.amount).toBe(21.5);

    const contract = await supplierClient.createContract({
      supplierId: supplier.supplierId,
      tenantId: "tenant-1",
      startsAt: "2026-01-01T00:00:00.000Z",
      paymentTermsDueInDays: 30,
    });
    expect(contract.paymentTermsDueInDays).toBe(30);

    const records = await supplierClient.recordPerformance({
      supplierId: supplier.supplierId,
      tenantId: "tenant-1",
      purchaseOrderId: "po-1",
      promisedAt: "2026-01-10T00:00:00.000Z",
      receivedAt: "2026-01-09T00:00:00.000Z",
      quantityOrdered: 100,
      quantityReceived: 100,
    });
    expect(records.map((r) => r.observationType)).toEqual(["OnTimeDelivery", "QuantityMatch"]);
  });

  it("findById devolve undefined para Supplier inexistente — 404 tratado como ausência, nunca como erro (undefinedOn404)", async () => {
    await expect(supplierClient.findById("supplier-inexistente")).resolves.toBeUndefined();
  });

  it("register com o mesmo taxId no mesmo Tenant lança ApiError 409 real, produzido pelo mapSupplierError de apps/api", async () => {
    await supplierClient.register({ tenantId: "tenant-1", legalName: "Primeiro", taxId: "12345678000199" });

    const error = await supplierClient.register({ tenantId: "tenant-1", legalName: "Segundo", taxId: "12345678000199" }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).statusCode).toBe(409);
  });

  it("register com taxId em formato inválido lança ApiError 422 real", async () => {
    const error = await supplierClient.register({ tenantId: "tenant-1", legalName: "Inválido", taxId: "123" }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).statusCode).toBe(422);
  });

  it("disable de um Supplier já desabilitado lança ApiError 409 real (transição de status inválida)", async () => {
    const supplier = await supplierClient.register({ tenantId: "tenant-1", legalName: "Fornecedor", taxId: "12345678000199" });
    await supplierClient.disable(supplier.supplierId);

    const error = await supplierClient.disable(supplier.supplierId).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).statusCode).toBe(409);
  });

  describe("integração com autenticação (interceptor já existente, nenhum código novo)", () => {
    it("com Access Token definido via apiClient.setAccessToken, a requisição real ao servidor carrega Authorization: Bearer <token>", async () => {
      let capturedAuthorization: string | undefined;
      await server.close();
      server = await startRealApiServer((fastify) => {
        fastify.addHook("onRequest", (request, _reply, done) => {
          capturedAuthorization = request.headers.authorization;
          done();
        });
      });

      apiClient.setAccessToken("session-de-teste");
      await supplierClient.listByTenant("tenant-1");

      expect(capturedAuthorization).toBe("Bearer session-de-teste");
      apiClient.setAccessToken(undefined);
    });

    it("sem Access Token, nenhum cabeçalho Authorization é enviado ao servidor real", async () => {
      let capturedAuthorization: string | undefined;
      await server.close();
      server = await startRealApiServer((fastify) => {
        fastify.addHook("onRequest", (request, _reply, done) => {
          capturedAuthorization = request.headers.authorization;
          done();
        });
      });

      await supplierClient.listByTenant("tenant-1");

      expect(capturedAuthorization).toBeUndefined();
    });
  });
});
