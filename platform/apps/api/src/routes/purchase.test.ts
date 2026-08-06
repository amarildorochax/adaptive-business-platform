import { describe, expect, it } from "vitest";
import { buildTestServer } from "../testing/buildTestServer.js";

describe("Rotas HTTP do Purchase Hub — Purchase Order", () => {
  it("fluxo completo via HTTP real: createPurchaseOrder -> addItem -> approve -> send -> registerReceiving (recebimento único e completo)", async () => {
    const fastify = await buildTestServer();

    const created = await fastify.inject({
      method: "POST",
      url: "/purchase-orders",
      payload: { tenantId: "tenant-1", supplierId: "supplier-1" },
    });
    expect(created.statusCode).toBe(201);
    const purchaseOrder = created.json() as { purchaseOrderId: string; status: string };
    expect(purchaseOrder.status).toBe("Draft");

    const withItem = await fastify.inject({
      method: "POST",
      url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/items`,
      payload: { productId: "product-1", quantityOrdered: 10, acquisitionCost: { amount: 10, currencyCode: "BRL" } },
    });
    expect(withItem.statusCode).toBe(201);
    const withItemBody = withItem.json() as { status: string; items: { purchaseOrderItemId: string }[] };
    expect(withItemBody.status).toBe("PendingApproval");
    const itemId = withItemBody.items[0]!.purchaseOrderItemId;

    const approved = await fastify.inject({
      method: "POST",
      url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/approve`,
      payload: { threshold: { amount: 1000, currencyCode: "BRL" } },
    });
    expect(approved.statusCode).toBe(200);
    expect((approved.json() as { status: string }).status).toBe("Approved");

    const sent = await fastify.inject({ method: "POST", url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/send` });
    expect(sent.statusCode).toBe(200);
    expect((sent.json() as { status: string }).status).toBe("Sent");

    const received = await fastify.inject({
      method: "POST",
      url: "/receivings",
      payload: {
        purchaseOrderId: purchaseOrder.purchaseOrderId,
        tenantId: "tenant-1",
        lines: [{ purchaseOrderItemId: itemId, quantityReceived: 10 }],
        receivedAt: "2026-02-01T00:00:00.000Z",
      },
    });
    expect(received.statusCode).toBe(201);
    const receivedBody = received.json() as { fullyReceived: boolean; purchaseOrder: { status: string } };
    expect(receivedBody.fullyReceived).toBe(true);
    expect(receivedBody.purchaseOrder.status).toBe("Received");

    const receivings = await fastify.inject({ method: "GET", url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/receivings` });
    expect(receivings.statusCode).toBe(200);
    expect(receivings.json()).toHaveLength(1);

    await fastify.close();
  });

  /**
   * BUG-001 (corrigido) — `SqlitePurchaseOrderRepository.update` (IMP-302) regravava
   * `purchase_order_items` por completo (`DELETE` + `INSERT`, mesmo padrão de
   * `SqliteSupplierRepository.replaceContacts`) — mas, diferente de `supplier_contacts`,
   * `purchase_order_items` é referenciada por FOREIGN KEY real a partir de `receiving_lines`
   * (IMP-302, Capítulo 4). A partir do segundo `registerReceiving` contra o mesmo Purchase Order, o
   * `DELETE` violava essa FOREIGN KEY (a primeira Receiving já referencia o item), e a chamada falhava
   * com 500. Corrigido em `SqlitePurchaseOrderRepository.replaceItems` (diff seletivo UPDATE/INSERT/
   * DELETE, nunca excluindo uma linha ainda referenciada) — ver
   * `docs/implementation/BUG_001_REGISTER_RECEIVING_HTTP500.md`. Este teste, antes marcado
   * `it.fails`, agora é a asserção de regressão permanente do comportamento correto.
   */
  it("segundo registerReceiving contra o mesmo item completa o recebimento (regressão de BUG-001)", async () => {
    const fastify = await buildTestServer();
    const created = await fastify.inject({ method: "POST", url: "/purchase-orders", payload: { tenantId: "tenant-1", supplierId: "supplier-1" } });
    const purchaseOrder = created.json() as { purchaseOrderId: string };
    const withItem = await fastify.inject({
      method: "POST",
      url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/items`,
      payload: { productId: "product-1", quantityOrdered: 10, acquisitionCost: { amount: 10, currencyCode: "BRL" } },
    });
    const itemId = (withItem.json() as { items: { purchaseOrderItemId: string }[] }).items[0]!.purchaseOrderItemId;
    await fastify.inject({
      method: "POST",
      url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/approve`,
      payload: { threshold: { amount: 1000, currencyCode: "BRL" } },
    });
    await fastify.inject({ method: "POST", url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/send` });
    await fastify.inject({
      method: "POST",
      url: "/receivings",
      payload: {
        purchaseOrderId: purchaseOrder.purchaseOrderId,
        tenantId: "tenant-1",
        lines: [{ purchaseOrderItemId: itemId, quantityReceived: 4 }],
        receivedAt: "2026-02-01T00:00:00.000Z",
      },
    });

    const second = await fastify.inject({
      method: "POST",
      url: "/receivings",
      payload: {
        purchaseOrderId: purchaseOrder.purchaseOrderId,
        tenantId: "tenant-1",
        lines: [{ purchaseOrderItemId: itemId, quantityReceived: 6 }],
        receivedAt: "2026-02-02T00:00:00.000Z",
      },
    });

    expect(second.statusCode).toBe(201);
    expect((second.json() as { fullyReceived: boolean }).fullyReceived).toBe(true);

    await fastify.close();
  });

  it("listagem: by-tenant/open e by-supplier refletem o estado real", async () => {
    const fastify = await buildTestServer();

    const created = await fastify.inject({ method: "POST", url: "/purchase-orders", payload: { tenantId: "tenant-1", supplierId: "supplier-1" } });
    const purchaseOrder = created.json() as { purchaseOrderId: string };

    const open = await fastify.inject({ method: "GET", url: "/purchase-orders/by-tenant/tenant-1/open" });
    expect(open.statusCode).toBe(200);
    expect(open.json()).toHaveLength(1);

    const bySupplier = await fastify.inject({ method: "GET", url: "/purchase-orders/by-supplier/supplier-1" });
    expect(bySupplier.statusCode).toBe(200);
    expect((bySupplier.json() as { purchaseOrderId: string }[])[0]?.purchaseOrderId).toBe(purchaseOrder.purchaseOrderId);

    await fastify.close();
  });

  it("400 — criar Purchase Order sem 'supplierId' (obrigatório) é rejeitado pela validação de schema", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "POST", url: "/purchase-orders", payload: { tenantId: "tenant-1" } });

    expect(response.statusCode).toBe(400);
    await fastify.close();
  });

  it("404 — buscar um Purchase Order inexistente", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "GET", url: "/purchase-orders/po-inexistente" });

    expect(response.statusCode).toBe(404);
    await fastify.close();
  });

  it("409 — adicionar item a um Purchase Order que já saiu da fase de montagem", async () => {
    const fastify = await buildTestServer();
    const created = await fastify.inject({ method: "POST", url: "/purchase-orders", payload: { tenantId: "tenant-1", supplierId: "supplier-1" } });
    const purchaseOrder = created.json() as { purchaseOrderId: string };
    await fastify.inject({
      method: "POST",
      url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/items`,
      payload: { productId: "product-1", quantityOrdered: 10, acquisitionCost: { amount: 10, currencyCode: "BRL" } },
    });
    await fastify.inject({
      method: "POST",
      url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/approve`,
      payload: { threshold: { amount: 1000, currencyCode: "BRL" } },
    });
    await fastify.inject({ method: "POST", url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/send` });

    const response = await fastify.inject({
      method: "POST",
      url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/items`,
      payload: { productId: "product-2", quantityOrdered: 1, acquisitionCost: { amount: 1, currencyCode: "BRL" } },
    });

    expect(response.statusCode).toBe(409);
    await fastify.close();
  });

  it("409 — cancelar um Purchase Order que já possui Receiving", async () => {
    const fastify = await buildTestServer();
    const created = await fastify.inject({ method: "POST", url: "/purchase-orders", payload: { tenantId: "tenant-1", supplierId: "supplier-1" } });
    const purchaseOrder = created.json() as { purchaseOrderId: string };
    const withItem = await fastify.inject({
      method: "POST",
      url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/items`,
      payload: { productId: "product-1", quantityOrdered: 10, acquisitionCost: { amount: 10, currencyCode: "BRL" } },
    });
    const itemId = (withItem.json() as { items: { purchaseOrderItemId: string }[] }).items[0]!.purchaseOrderItemId;
    await fastify.inject({
      method: "POST",
      url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/approve`,
      payload: { threshold: { amount: 1000, currencyCode: "BRL" } },
    });
    await fastify.inject({ method: "POST", url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/send` });
    await fastify.inject({
      method: "POST",
      url: "/receivings",
      payload: {
        purchaseOrderId: purchaseOrder.purchaseOrderId,
        tenantId: "tenant-1",
        lines: [{ purchaseOrderItemId: itemId, quantityReceived: 1 }],
        receivedAt: "2026-02-01T00:00:00.000Z",
      },
    });

    const response = await fastify.inject({ method: "POST", url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/cancel` });

    expect(response.statusCode).toBe(409);
    await fastify.close();
  });

  it("422 — aprovar Purchase Order acima do threshold sem identidade de aprovação explícita", async () => {
    const fastify = await buildTestServer();
    const created = await fastify.inject({ method: "POST", url: "/purchase-orders", payload: { tenantId: "tenant-1", supplierId: "supplier-1" } });
    const purchaseOrder = created.json() as { purchaseOrderId: string };
    await fastify.inject({
      method: "POST",
      url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/items`,
      payload: { productId: "product-1", quantityOrdered: 10, acquisitionCost: { amount: 10, currencyCode: "BRL" } },
    });

    const response = await fastify.inject({
      method: "POST",
      url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/approve`,
      payload: { threshold: { amount: 50, currencyCode: "BRL" } },
    });

    expect(response.statusCode).toBe(422);
    await fastify.close();
  });

  it("aprova acima do threshold quando approvedByIdentityId é informado", async () => {
    const fastify = await buildTestServer();
    const created = await fastify.inject({ method: "POST", url: "/purchase-orders", payload: { tenantId: "tenant-1", supplierId: "supplier-1" } });
    const purchaseOrder = created.json() as { purchaseOrderId: string };
    await fastify.inject({
      method: "POST",
      url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/items`,
      payload: { productId: "product-1", quantityOrdered: 10, acquisitionCost: { amount: 10, currencyCode: "BRL" } },
    });

    const response = await fastify.inject({
      method: "POST",
      url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/approve`,
      payload: { threshold: { amount: 50, currencyCode: "BRL" }, approvedByIdentityId: "identity-1" },
    });

    expect(response.statusCode).toBe(200);
    expect((response.json() as { approvedByIdentityId: string }).approvedByIdentityId).toBe("identity-1");
    await fastify.close();
  });

  it("422 — registrar Receiving com quantidade acima da pendente", async () => {
    const fastify = await buildTestServer();
    const created = await fastify.inject({ method: "POST", url: "/purchase-orders", payload: { tenantId: "tenant-1", supplierId: "supplier-1" } });
    const purchaseOrder = created.json() as { purchaseOrderId: string };
    const withItem = await fastify.inject({
      method: "POST",
      url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/items`,
      payload: { productId: "product-1", quantityOrdered: 10, acquisitionCost: { amount: 10, currencyCode: "BRL" } },
    });
    const itemId = (withItem.json() as { items: { purchaseOrderItemId: string }[] }).items[0]!.purchaseOrderItemId;
    await fastify.inject({
      method: "POST",
      url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/approve`,
      payload: { threshold: { amount: 1000, currencyCode: "BRL" } },
    });
    await fastify.inject({ method: "POST", url: `/purchase-orders/${purchaseOrder.purchaseOrderId}/send` });

    const response = await fastify.inject({
      method: "POST",
      url: "/receivings",
      payload: {
        purchaseOrderId: purchaseOrder.purchaseOrderId,
        tenantId: "tenant-1",
        lines: [{ purchaseOrderItemId: itemId, quantityReceived: 11 }],
        receivedAt: "2026-02-01T00:00:00.000Z",
      },
    });

    expect(response.statusCode).toBe(422);
    await fastify.close();
  });

  it("dado criado via HTTP sobrevive à consulta subsequente sobre a mesma conexão SQLite (sem mocks)", async () => {
    const fastify = await buildTestServer();

    const created = await fastify.inject({ method: "POST", url: "/purchase-orders", payload: { tenantId: "tenant-1", supplierId: "supplier-1" } });
    const purchaseOrder = created.json() as { purchaseOrderId: string };

    const found = await fastify.inject({ method: "GET", url: `/purchase-orders/${purchaseOrder.purchaseOrderId}` });
    expect((found.json() as { supplierId: string }).supplierId).toBe("supplier-1");

    await fastify.close();
  });
});

describe("Rotas HTTP do Purchase Hub — Purchase Requisition", () => {
  it("fluxo completo via HTTP real: create -> approve -> convert em Purchase Order", async () => {
    const fastify = await buildTestServer();

    const created = await fastify.inject({
      method: "POST",
      url: "/purchase-requisitions",
      payload: { tenantId: "tenant-1", origin: "Manual", lines: [{ productId: "product-1", suggestedQuantity: 30 }] },
    });
    expect(created.statusCode).toBe(201);
    const requisition = created.json() as { requisitionId: string; status: string };
    expect(requisition.status).toBe("Open");

    const approved = await fastify.inject({ method: "POST", url: `/purchase-requisitions/${requisition.requisitionId}/approve` });
    expect(approved.statusCode).toBe(200);
    expect((approved.json() as { status: string }).status).toBe("Approved");

    const converted = await fastify.inject({
      method: "POST",
      url: `/purchase-requisitions/${requisition.requisitionId}/convert`,
      payload: { supplierId: "supplier-1", acquisitionCosts: [{ productId: "product-1", cost: { amount: 20, currencyCode: "BRL" } }] },
    });
    expect(converted.statusCode).toBe(201);
    const conversion = converted.json() as { requisition: { status: string }; purchaseOrder: { status: string; items: { acquisitionCost: { amount: number } }[] } };
    expect(conversion.requisition.status).toBe("ConvertedToPurchaseOrder");
    expect(conversion.purchaseOrder.status).toBe("PendingApproval");
    expect(conversion.purchaseOrder.items[0]?.acquisitionCost.amount).toBe(20);

    await fastify.close();
  });

  it("rejeita uma Purchase Requisition", async () => {
    const fastify = await buildTestServer();
    const created = await fastify.inject({
      method: "POST",
      url: "/purchase-requisitions",
      payload: { tenantId: "tenant-1", origin: "Manual", lines: [{ productId: "product-1", suggestedQuantity: 30 }] },
    });
    const requisition = created.json() as { requisitionId: string };

    const rejected = await fastify.inject({ method: "POST", url: `/purchase-requisitions/${requisition.requisitionId}/reject` });
    expect(rejected.statusCode).toBe(200);
    expect((rejected.json() as { status: string }).status).toBe("Rejected");

    await fastify.close();
  });

  it("listagem por status via path aninhado (by-tenant/:tenantId/status/:status)", async () => {
    const fastify = await buildTestServer();
    await fastify.inject({
      method: "POST",
      url: "/purchase-requisitions",
      payload: { tenantId: "tenant-1", origin: "Manual", lines: [{ productId: "product-1", suggestedQuantity: 30 }] },
    });

    const open = await fastify.inject({ method: "GET", url: "/purchase-requisitions/by-tenant/tenant-1/status/Open" });
    expect(open.statusCode).toBe(200);
    expect(open.json()).toHaveLength(1);

    const approved = await fastify.inject({ method: "GET", url: "/purchase-requisitions/by-tenant/tenant-1/status/Approved" });
    expect(approved.json()).toHaveLength(0);

    await fastify.close();
  });

  it("400 — status inexistente no path é rejeitado pela validação de schema (enum)", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "GET", url: "/purchase-requisitions/by-tenant/tenant-1/status/NaoExiste" });

    expect(response.statusCode).toBe(400);
    await fastify.close();
  });

  it("404 — buscar uma Purchase Requisition inexistente", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "GET", url: "/purchase-requisitions/req-inexistente" });

    expect(response.statusCode).toBe(404);
    await fastify.close();
  });

  it("409 — converter uma Purchase Requisition ainda não aprovada", async () => {
    const fastify = await buildTestServer();
    const created = await fastify.inject({
      method: "POST",
      url: "/purchase-requisitions",
      payload: { tenantId: "tenant-1", origin: "Manual", lines: [{ productId: "product-1", suggestedQuantity: 30 }] },
    });
    const requisition = created.json() as { requisitionId: string };

    const response = await fastify.inject({
      method: "POST",
      url: `/purchase-requisitions/${requisition.requisitionId}/convert`,
      payload: { supplierId: "supplier-1", acquisitionCosts: [{ productId: "product-1", cost: { amount: 20, currencyCode: "BRL" } }] },
    });

    expect(response.statusCode).toBe(409);
    await fastify.close();
  });

  it("422 — converter sem informar custo de aquisição para algum Produto sugerido", async () => {
    const fastify = await buildTestServer();
    const created = await fastify.inject({
      method: "POST",
      url: "/purchase-requisitions",
      payload: { tenantId: "tenant-1", origin: "Manual", lines: [{ productId: "product-1", suggestedQuantity: 30 }] },
    });
    const requisition = created.json() as { requisitionId: string };
    await fastify.inject({ method: "POST", url: `/purchase-requisitions/${requisition.requisitionId}/approve` });

    const response = await fastify.inject({
      method: "POST",
      url: `/purchase-requisitions/${requisition.requisitionId}/convert`,
      payload: { supplierId: "supplier-1", acquisitionCosts: [] },
    });

    expect(response.statusCode).toBe(422);
    await fastify.close();
  });
});

describe("Rotas HTTP do Purchase Hub — Reorder Rule", () => {
  it("fluxo completo via HTTP real: create -> evaluate (dispara, cria Purchase Requisition) -> deactivate", async () => {
    const fastify = await buildTestServer();

    const created = await fastify.inject({
      method: "POST",
      url: "/reorder-rules",
      payload: { tenantId: "tenant-1", productId: "product-1", thresholdQuantity: 10, reorderQuantity: 50 },
    });
    expect(created.statusCode).toBe(201);
    const rule = created.json() as { ruleId: string; active: boolean };
    expect(rule.active).toBe(true);

    const evaluated = await fastify.inject({
      method: "POST",
      url: `/reorder-rules/${rule.ruleId}/evaluate`,
      payload: { currentQuantity: 5 },
    });
    expect(evaluated.statusCode).toBe(200);
    const evaluation = evaluated.json() as { triggered: boolean; requisition?: { origin: string } };
    expect(evaluation.triggered).toBe(true);
    expect(evaluation.requisition?.origin).toBe("ReorderRule");

    const notTriggered = await fastify.inject({
      method: "POST",
      url: `/reorder-rules/${rule.ruleId}/evaluate`,
      payload: { currentQuantity: 20 },
    });
    expect((notTriggered.json() as { triggered: boolean; requisition?: unknown }).triggered).toBe(false);
    expect((notTriggered.json() as { requisition?: unknown }).requisition).toBeUndefined();

    const deactivated = await fastify.inject({ method: "POST", url: `/reorder-rules/${rule.ruleId}/deactivate` });
    expect(deactivated.statusCode).toBe(200);
    expect((deactivated.json() as { active: boolean }).active).toBe(false);

    await fastify.close();
  });

  it("404 — avaliar uma Reorder Rule inexistente", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "POST", url: "/reorder-rules/rule-inexistente/evaluate", payload: { currentQuantity: 1 } });

    expect(response.statusCode).toBe(404);
    await fastify.close();
  });

  it("400 — criar Reorder Rule sem 'reorderQuantity' (obrigatório) é rejeitado pela validação de schema", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({
      method: "POST",
      url: "/reorder-rules",
      payload: { tenantId: "tenant-1", productId: "product-1", thresholdQuantity: 10 },
    });

    expect(response.statusCode).toBe(400);
    await fastify.close();
  });
});

describe("Documentação OpenAPI — Purchase Hub", () => {
  it("expõe todos os dezenove endpoints com a tag 'purchase'", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "GET", url: "/documentation/json" });
    expect(response.statusCode).toBe(200);

    const doc = response.json() as { paths: Record<string, unknown>; tags: { name: string }[] };
    expect(doc.tags.map((tag) => tag.name)).toContain("purchase");
    expect(Object.keys(doc.paths)).toEqual(
      expect.arrayContaining([
        "/purchase-orders",
        "/purchase-orders/{purchaseOrderId}",
        "/purchase-orders/by-tenant/{tenantId}/open",
        "/purchase-orders/by-supplier/{supplierId}",
        "/purchase-orders/{purchaseOrderId}/items",
        "/purchase-orders/{purchaseOrderId}/approve",
        "/purchase-orders/{purchaseOrderId}/send",
        "/purchase-orders/{purchaseOrderId}/cancel",
        "/purchase-orders/{purchaseOrderId}/receivings",
        "/receivings",
        "/purchase-requisitions",
        "/purchase-requisitions/{requisitionId}",
        "/purchase-requisitions/by-tenant/{tenantId}/status/{status}",
        "/purchase-requisitions/{requisitionId}/approve",
        "/purchase-requisitions/{requisitionId}/reject",
        "/purchase-requisitions/{requisitionId}/convert",
        "/reorder-rules",
        "/reorder-rules/{ruleId}/deactivate",
        "/reorder-rules/{ruleId}/evaluate",
      ]),
    );

    await fastify.close();
  });
});
