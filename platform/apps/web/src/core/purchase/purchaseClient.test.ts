import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../http/ApiError.js";
import { apiClient } from "../http/client.js";
import { purchaseClient } from "./purchaseClient.js";
import { startRealApiServer, type RealApiServer } from "./testing/realApiServer.js";

/**
 * Integração real do Purchase Hub — nenhum mock de `fetch`, chamada HTTP real contra uma instância
 * real de `apps/api` (Fastify + SQLite `:memory:`), per instrução explícita de IMP-304. Servidor
 * novo por teste, mesma disciplina de `supplierClient.test.ts` (IMP-204).
 */
describe("purchaseClient — integração HTTP real (sem mock)", () => {
  let server: RealApiServer;

  beforeEach(async () => {
    server = await startRealApiServer();
  });

  afterEach(async () => {
    await server.close();
  });

  it("createPurchaseOrder -> addPurchaseOrderItem -> approvePurchaseOrder -> sendPurchaseOrderToSupplier -> registerReceiving, fim a fim contra o servidor real", async () => {
    const created = await purchaseClient.createPurchaseOrder({ tenantId: "tenant-1", supplierId: "supplier-1" });
    expect(created.status).toBe("Draft");

    const withItem = await purchaseClient.addPurchaseOrderItem(created.purchaseOrderId, {
      productId: "product-1",
      quantityOrdered: 10,
      acquisitionCost: { amount: 10, currencyCode: "BRL" },
    });
    expect(withItem.status).toBe("PendingApproval");
    const itemId = withItem.items[0]!.purchaseOrderItemId;

    const approved = await purchaseClient.approvePurchaseOrder(created.purchaseOrderId, { threshold: { amount: 1000, currencyCode: "BRL" } });
    expect(approved.status).toBe("Approved");

    const sent = await purchaseClient.sendPurchaseOrderToSupplier(created.purchaseOrderId);
    expect(sent.status).toBe("Sent");

    const registration = await purchaseClient.registerReceiving({
      purchaseOrderId: created.purchaseOrderId,
      tenantId: "tenant-1",
      lines: [{ purchaseOrderItemId: itemId, quantityReceived: 10 }],
      receivedAt: "2026-02-01T00:00:00.000Z",
    });
    expect(registration.fullyReceived).toBe(true);
    expect(registration.purchaseOrder.status).toBe("Received");

    const found = await purchaseClient.findPurchaseOrderById(created.purchaseOrderId);
    expect(found?.status).toBe("Received");

    const receivings = await purchaseClient.listReceivingsByPurchaseOrder(created.purchaseOrderId);
    expect(receivings).toHaveLength(1);

    const bySupplier = await purchaseClient.listPurchaseOrdersBySupplier("supplier-1");
    expect(bySupplier.map((po) => po.purchaseOrderId)).toContain(created.purchaseOrderId);
  });

  it("listOpenPurchaseOrdersByTenant reflete apenas os Purchase Order ainda abertos", async () => {
    const draft = await purchaseClient.createPurchaseOrder({ tenantId: "tenant-1", supplierId: "supplier-1" });
    const toCancel = await purchaseClient.createPurchaseOrder({ tenantId: "tenant-1", supplierId: "supplier-1" });
    await purchaseClient.cancelPurchaseOrder(toCancel.purchaseOrderId);

    const open = await purchaseClient.listOpenPurchaseOrdersByTenant("tenant-1");

    expect(open.map((po) => po.purchaseOrderId)).toEqual([draft.purchaseOrderId]);
  });

  it("createPurchaseRequisition -> approvePurchaseRequisition -> convertRequisitionToPurchaseOrder, fim a fim contra o servidor real", async () => {
    const requisition = await purchaseClient.createPurchaseRequisition({
      tenantId: "tenant-1",
      origin: "Manual",
      lines: [{ productId: "product-1", suggestedQuantity: 30 }],
    });
    expect(requisition.status).toBe("Open");

    const approved = await purchaseClient.approvePurchaseRequisition(requisition.requisitionId);
    expect(approved.status).toBe("Approved");

    const conversion = await purchaseClient.convertRequisitionToPurchaseOrder(requisition.requisitionId, {
      supplierId: "supplier-1",
      acquisitionCosts: [{ productId: "product-1", cost: { amount: 20, currencyCode: "BRL" } }],
    });
    expect(conversion.requisition.status).toBe("ConvertedToPurchaseOrder");
    expect(conversion.purchaseOrder.status).toBe("PendingApproval");

    const found = await purchaseClient.findPurchaseRequisitionById(requisition.requisitionId);
    expect(found?.purchaseOrderId).toBe(conversion.purchaseOrder.purchaseOrderId);

    const converted = await purchaseClient.listPurchaseRequisitionsByStatus("tenant-1", "ConvertedToPurchaseOrder");
    expect(converted).toHaveLength(1);
  });

  it("rejectPurchaseRequisition, fim a fim contra o servidor real", async () => {
    const requisition = await purchaseClient.createPurchaseRequisition({
      tenantId: "tenant-1",
      origin: "Manual",
      lines: [{ productId: "product-1", suggestedQuantity: 30 }],
    });

    const rejected = await purchaseClient.rejectPurchaseRequisition(requisition.requisitionId);

    expect(rejected.status).toBe("Rejected");
  });

  it("createReorderRule -> evaluateReorderRule (dispara) -> deactivateReorderRule, fim a fim contra o servidor real", async () => {
    const rule = await purchaseClient.createReorderRule({
      tenantId: "tenant-1",
      productId: "product-1",
      thresholdQuantity: 10,
      reorderQuantity: 50,
    });
    expect(rule.active).toBe(true);

    const evaluation = await purchaseClient.evaluateReorderRule(rule.ruleId, { currentQuantity: 5 });
    expect(evaluation.triggered).toBe(true);
    expect(evaluation.requisition?.origin).toBe("ReorderRule");

    const deactivated = await purchaseClient.deactivateReorderRule(rule.ruleId);
    expect(deactivated.active).toBe(false);
  });

  it("findPurchaseOrderById devolve undefined para Purchase Order inexistente — 404 tratado como ausência", async () => {
    await expect(purchaseClient.findPurchaseOrderById("po-inexistente")).resolves.toBeUndefined();
  });

  it("findPurchaseRequisitionById devolve undefined para Requisition inexistente — 404 tratado como ausência", async () => {
    await expect(purchaseClient.findPurchaseRequisitionById("req-inexistente")).resolves.toBeUndefined();
  });

  it("approvePurchaseOrder acima do threshold sem identidade lança ApiError 422 real, produzido por mapPurchaseError de apps/api", async () => {
    const created = await purchaseClient.createPurchaseOrder({ tenantId: "tenant-1", supplierId: "supplier-1" });
    await purchaseClient.addPurchaseOrderItem(created.purchaseOrderId, {
      productId: "product-1",
      quantityOrdered: 10,
      acquisitionCost: { amount: 10, currencyCode: "BRL" },
    });

    const error = await purchaseClient
      .approvePurchaseOrder(created.purchaseOrderId, { threshold: { amount: 50, currencyCode: "BRL" } })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).statusCode).toBe(422);
  });

  it("addPurchaseOrderItem após o Purchase Order sair da fase de montagem lança ApiError 409 real", async () => {
    const created = await purchaseClient.createPurchaseOrder({ tenantId: "tenant-1", supplierId: "supplier-1" });
    await purchaseClient.addPurchaseOrderItem(created.purchaseOrderId, {
      productId: "product-1",
      quantityOrdered: 10,
      acquisitionCost: { amount: 10, currencyCode: "BRL" },
    });
    await purchaseClient.approvePurchaseOrder(created.purchaseOrderId, { threshold: { amount: 1000, currencyCode: "BRL" } });
    await purchaseClient.sendPurchaseOrderToSupplier(created.purchaseOrderId);

    const error = await purchaseClient
      .addPurchaseOrderItem(created.purchaseOrderId, { productId: "product-2", quantityOrdered: 1, acquisitionCost: { amount: 1, currencyCode: "BRL" } })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).statusCode).toBe(409);
  });

  it("cancelPurchaseOrder após qualquer Receiving lança ApiError 409 real", async () => {
    const created = await purchaseClient.createPurchaseOrder({ tenantId: "tenant-1", supplierId: "supplier-1" });
    const withItem = await purchaseClient.addPurchaseOrderItem(created.purchaseOrderId, {
      productId: "product-1",
      quantityOrdered: 10,
      acquisitionCost: { amount: 10, currencyCode: "BRL" },
    });
    const itemId = withItem.items[0]!.purchaseOrderItemId;
    await purchaseClient.approvePurchaseOrder(created.purchaseOrderId, { threshold: { amount: 1000, currencyCode: "BRL" } });
    await purchaseClient.sendPurchaseOrderToSupplier(created.purchaseOrderId);
    await purchaseClient.registerReceiving({
      purchaseOrderId: created.purchaseOrderId,
      tenantId: "tenant-1",
      lines: [{ purchaseOrderItemId: itemId, quantityReceived: 10 }],
      receivedAt: "2026-02-01T00:00:00.000Z",
    });

    const error = await purchaseClient.cancelPurchaseOrder(created.purchaseOrderId).catch((e: unknown) => e);

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
      await purchaseClient.listOpenPurchaseOrdersByTenant("tenant-1");

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

      await purchaseClient.listOpenPurchaseOrdersByTenant("tenant-1");

      expect(capturedAuthorization).toBeUndefined();
    });
  });
});
