import { describe, expect, it } from "vitest";
import { buildTestServer } from "../testing/buildTestServer.js";

async function createBillOfMaterials(
  fastify: Awaited<ReturnType<typeof buildTestServer>>,
  overrides: Record<string, unknown> = {},
) {
  const response = await fastify.inject({
    method: "POST",
    url: "/bills-of-materials",
    payload: {
      tenantId: "tenant-1",
      outputProductId: "bread",
      lines: [{ inputProductId: "flour", quantityPerOutputUnit: 2, unitOfMeasure: "Kilogram" }],
      ...overrides,
    },
  });
  return response.json() as { billOfMaterialsId: string; version: number; status: string };
}

async function createProductionOrder(
  fastify: Awaited<ReturnType<typeof buildTestServer>>,
  billOfMaterialsId: string,
  overrides: Record<string, unknown> = {},
) {
  const response = await fastify.inject({
    method: "POST",
    url: "/production-orders",
    payload: { tenantId: "tenant-1", billOfMaterialsId, plannedOutputQuantity: 10, ...overrides },
  });
  return response.json() as { productionOrderId: string; status: string };
}

describe("Rotas HTTP — Bill of Materials", () => {
  it("POST /bills-of-materials — 201, cria a primeira versão Active", async () => {
    const fastify = await buildTestServer();
    const response = await fastify.inject({
      method: "POST",
      url: "/bills-of-materials",
      payload: {
        tenantId: "tenant-1",
        outputProductId: "bread",
        lines: [{ inputProductId: "flour", quantityPerOutputUnit: 2, unitOfMeasure: "Kilogram" }],
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json() as { version: number; status: string; lines: unknown[] };
    expect(body.version).toBe(1);
    expect(body.status).toBe("Active");
    expect(body.lines).toHaveLength(1);
    await fastify.close();
  });

  it("POST /bills-of-materials — 400, schema rejeita corpo sem outputProductId", async () => {
    const fastify = await buildTestServer();
    const response = await fastify.inject({ method: "POST", url: "/bills-of-materials", payload: { tenantId: "tenant-1", lines: [] } });
    expect(response.statusCode).toBe(400);
    await fastify.close();
  });

  it("POST /bills-of-materials — 422, quantityPerOutputUnit não positiva é aceita pelo schema mas rejeitada pelo Core (InvalidBOMLineError)", async () => {
    const fastify = await buildTestServer();
    const response = await fastify.inject({
      method: "POST",
      url: "/bills-of-materials",
      payload: { tenantId: "tenant-1", outputProductId: "bread", lines: [{ inputProductId: "flour", quantityPerOutputUnit: 0, unitOfMeasure: "Kilogram" }] },
    });
    expect(response.statusCode).toBe(422);
    await fastify.close();
  });

  it("POST /bills-of-materials/:id/supersede — 201, marca a corrente Superseded e cria a próxima Active", async () => {
    const fastify = await buildTestServer();
    const bom = await createBillOfMaterials(fastify);

    const response = await fastify.inject({
      method: "POST",
      url: `/bills-of-materials/${bom.billOfMaterialsId}/supersede`,
      payload: { lines: [{ inputProductId: "flour", quantityPerOutputUnit: 3, unitOfMeasure: "Kilogram" }] },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json() as { previous: { status: string }; next: { status: string; version: number } };
    expect(body.previous.status).toBe("Superseded");
    expect(body.next.status).toBe("Active");
    expect(body.next.version).toBe(2);
    await fastify.close();
  });

  it("POST /bills-of-materials/:id/supersede — 404 para identificador inexistente", async () => {
    const fastify = await buildTestServer();
    const response = await fastify.inject({ method: "POST", url: "/bills-of-materials/does-not-exist/supersede", payload: { lines: [] } });
    expect(response.statusCode).toBe(404);
    await fastify.close();
  });

  it("POST /bills-of-materials/:id/supersede — 409 ao superseder uma versão já Superseded", async () => {
    const fastify = await buildTestServer();
    const bom = await createBillOfMaterials(fastify);
    await fastify.inject({ method: "POST", url: `/bills-of-materials/${bom.billOfMaterialsId}/supersede`, payload: { lines: [] } });

    const second = await fastify.inject({ method: "POST", url: `/bills-of-materials/${bom.billOfMaterialsId}/supersede`, payload: { lines: [] } });
    expect(second.statusCode).toBe(409);
    await fastify.close();
  });

  it("GET /bills-of-materials/:id — 200 e 404", async () => {
    const fastify = await buildTestServer();
    const bom = await createBillOfMaterials(fastify);

    const found = await fastify.inject({ method: "GET", url: `/bills-of-materials/${bom.billOfMaterialsId}` });
    expect(found.statusCode).toBe(200);

    const missing = await fastify.inject({ method: "GET", url: "/bills-of-materials/does-not-exist" });
    expect(missing.statusCode).toBe(404);
    await fastify.close();
  });

  it("GET /bills-of-materials/by-product/:outputProductId/active — 200 e 404", async () => {
    const fastify = await buildTestServer();
    await createBillOfMaterials(fastify, { outputProductId: "bread" });

    const found = await fastify.inject({ method: "GET", url: "/bills-of-materials/by-product/bread/active" });
    expect(found.statusCode).toBe(200);

    const missing = await fastify.inject({ method: "GET", url: "/bills-of-materials/by-product/does-not-exist/active" });
    expect(missing.statusCode).toBe(404);
    await fastify.close();
  });
});

describe("Rotas HTTP — Production Order", () => {
  it("POST /production-orders — 201, cria em Planned", async () => {
    const fastify = await buildTestServer();
    const bom = await createBillOfMaterials(fastify);

    const response = await fastify.inject({
      method: "POST",
      url: "/production-orders",
      payload: { tenantId: "tenant-1", billOfMaterialsId: bom.billOfMaterialsId, plannedOutputQuantity: 10 },
    });

    expect(response.statusCode).toBe(201);
    expect((response.json() as { status: string }).status).toBe("Planned");
    await fastify.close();
  });

  it("POST /production-orders — 404 ao referenciar BillOfMaterials inexistente", async () => {
    const fastify = await buildTestServer();
    const response = await fastify.inject({
      method: "POST",
      url: "/production-orders",
      payload: { tenantId: "tenant-1", billOfMaterialsId: "does-not-exist", plannedOutputQuantity: 10 },
    });
    expect(response.statusCode).toBe(404);
    await fastify.close();
  });

  it("POST /production-orders — 409 ao referenciar BillOfMaterials Superseded", async () => {
    const fastify = await buildTestServer();
    const bom = await createBillOfMaterials(fastify);
    await fastify.inject({ method: "POST", url: `/bills-of-materials/${bom.billOfMaterialsId}/supersede`, payload: { lines: [] } });

    const response = await fastify.inject({
      method: "POST",
      url: "/production-orders",
      payload: { tenantId: "tenant-1", billOfMaterialsId: bom.billOfMaterialsId, plannedOutputQuantity: 10 },
    });
    expect(response.statusCode).toBe(409);
    await fastify.close();
  });

  it("GET /production-orders/:id — 200 e 404", async () => {
    const fastify = await buildTestServer();
    const bom = await createBillOfMaterials(fastify);
    const order = await createProductionOrder(fastify, bom.billOfMaterialsId);

    const found = await fastify.inject({ method: "GET", url: `/production-orders/${order.productionOrderId}` });
    expect(found.statusCode).toBe(200);

    const missing = await fastify.inject({ method: "GET", url: "/production-orders/does-not-exist" });
    expect(missing.statusCode).toBe(404);
    await fastify.close();
  });

  it("GET /production-orders/by-status/:status — filtra corretamente, 400 para status inválido", async () => {
    const fastify = await buildTestServer();
    const bom = await createBillOfMaterials(fastify);
    await createProductionOrder(fastify, bom.billOfMaterialsId);

    const planned = await fastify.inject({ method: "GET", url: "/production-orders/by-status/Planned" });
    expect(planned.statusCode).toBe(200);
    expect((planned.json() as unknown[]).length).toBeGreaterThan(0);

    const invalid = await fastify.inject({ method: "GET", url: "/production-orders/by-status/NotAStatus" });
    expect(invalid.statusCode).toBe(400);
    await fastify.close();
  });

  it("GET /production-orders/by-origin/:orderId — filtra por orderId, vazio quando ausente", async () => {
    const fastify = await buildTestServer();
    const bom = await createBillOfMaterials(fastify);
    const order = await createProductionOrder(fastify, bom.billOfMaterialsId, { orderId: "order-99" });

    const found = await fastify.inject({ method: "GET", url: "/production-orders/by-origin/order-99" });
    expect((found.json() as { productionOrderId: string }[]).map((o) => o.productionOrderId)).toEqual([order.productionOrderId]);

    const empty = await fastify.inject({ method: "GET", url: "/production-orders/by-origin/does-not-exist" });
    expect(empty.json()).toEqual([]);
    await fastify.close();
  });

  it("POST /production-orders/:id/start — insumo insuficiente permanece Planned (started: false), sem erro HTTP", async () => {
    const fastify = await buildTestServer();
    const bom = await createBillOfMaterials(fastify);
    const order = await createProductionOrder(fastify, bom.billOfMaterialsId);

    const response = await fastify.inject({
      method: "POST",
      url: `/production-orders/${order.productionOrderId}/start`,
      payload: { availableQuantities: { flour: 5 } },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { started: boolean; productionOrder: { status: string } };
    expect(body.started).toBe(false);
    expect(body.productionOrder.status).toBe("Planned");
    await fastify.close();
  });

  it("POST /production-orders/:id/start — insumo suficiente transiciona a InProgress (started: true)", async () => {
    const fastify = await buildTestServer();
    const bom = await createBillOfMaterials(fastify);
    const order = await createProductionOrder(fastify, bom.billOfMaterialsId);

    const response = await fastify.inject({
      method: "POST",
      url: `/production-orders/${order.productionOrderId}/start`,
      payload: { availableQuantities: { flour: 20 } },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { started: boolean; productionOrder: { status: string } };
    expect(body.started).toBe(true);
    expect(body.productionOrder.status).toBe("InProgress");
    await fastify.close();
  });

  it("POST /production-orders/:id/consumptions — 409 antes de StartProduction", async () => {
    const fastify = await buildTestServer();
    const bom = await createBillOfMaterials(fastify);
    const order = await createProductionOrder(fastify, bom.billOfMaterialsId);

    const response = await fastify.inject({
      method: "POST",
      url: `/production-orders/${order.productionOrderId}/consumptions`,
      payload: { inputProductId: "flour", quantityConsumed: 20, acquisitionCost: 40 },
    });
    expect(response.statusCode).toBe(409);
    await fastify.close();
  });

  it("POST /production-orders/:id/consumptions — 422 para quantidade não positiva", async () => {
    const fastify = await buildTestServer();
    const bom = await createBillOfMaterials(fastify);
    const order = await createProductionOrder(fastify, bom.billOfMaterialsId);
    await fastify.inject({ method: "POST", url: `/production-orders/${order.productionOrderId}/start`, payload: { availableQuantities: { flour: 20 } } });

    const response = await fastify.inject({
      method: "POST",
      url: `/production-orders/${order.productionOrderId}/consumptions`,
      payload: { inputProductId: "flour", quantityConsumed: 0, acquisitionCost: 40 },
    });
    expect(response.statusCode).toBe(422);
    await fastify.close();
  });

  it("POST /production-orders/:id/complete — 409 sem nenhum output registrado", async () => {
    const fastify = await buildTestServer();
    const bom = await createBillOfMaterials(fastify);
    const order = await createProductionOrder(fastify, bom.billOfMaterialsId);
    await fastify.inject({ method: "POST", url: `/production-orders/${order.productionOrderId}/start`, payload: { availableQuantities: { flour: 20 } } });

    const response = await fastify.inject({ method: "POST", url: `/production-orders/${order.productionOrderId}/complete` });
    expect(response.statusCode).toBe(409);
    await fastify.close();
  });

  it("POST /production-orders/:id/cancel — 200 antes de qualquer consumo; 409 depois de um consumo já registrado", async () => {
    const fastify = await buildTestServer();
    const bom = await createBillOfMaterials(fastify);
    const cancellable = await createProductionOrder(fastify, bom.billOfMaterialsId);
    const cancelResponse = await fastify.inject({
      method: "POST",
      url: `/production-orders/${cancellable.productionOrderId}/cancel`,
      payload: { reason: "Cliente desistiu" },
    });
    expect(cancelResponse.statusCode).toBe(200);
    expect((cancelResponse.json() as { status: string; cancelReason: string }).status).toBe("Cancelled");

    const withConsumption = await createProductionOrder(fastify, bom.billOfMaterialsId);
    await fastify.inject({ method: "POST", url: `/production-orders/${withConsumption.productionOrderId}/start`, payload: { availableQuantities: { flour: 20 } } });
    await fastify.inject({
      method: "POST",
      url: `/production-orders/${withConsumption.productionOrderId}/consumptions`,
      payload: { inputProductId: "flour", quantityConsumed: 20, acquisitionCost: 40 },
    });
    const blocked = await fastify.inject({ method: "POST", url: `/production-orders/${withConsumption.productionOrderId}/cancel`, payload: { reason: "tarde demais" } });
    expect(blocked.statusCode).toBe(409);
    await fastify.close();
  });

  it("GET .../total-consumed-cost e .../total-generated-quantity — 404 para ProductionOrder inexistente", async () => {
    const fastify = await buildTestServer();
    const cost = await fastify.inject({ method: "GET", url: "/production-orders/does-not-exist/total-consumed-cost" });
    expect(cost.statusCode).toBe(404);

    const quantity = await fastify.inject({ method: "GET", url: "/production-orders/does-not-exist/total-generated-quantity" });
    expect(quantity.statusCode).toBe(404);
    await fastify.close();
  });

  it("fluxo feliz completo: create BOM -> create Order -> start -> consumption -> output -> complete -> totais", async () => {
    const fastify = await buildTestServer();
    const bom = await createBillOfMaterials(fastify);
    const order = await createProductionOrder(fastify, bom.billOfMaterialsId);

    await fastify.inject({ method: "POST", url: `/production-orders/${order.productionOrderId}/start`, payload: { availableQuantities: { flour: 20 } } });
    await fastify.inject({
      method: "POST",
      url: `/production-orders/${order.productionOrderId}/consumptions`,
      payload: { inputProductId: "flour", quantityConsumed: 20, acquisitionCost: 40 },
    });
    const outputResponse = await fastify.inject({
      method: "POST",
      url: `/production-orders/${order.productionOrderId}/outputs`,
      payload: { outputProductId: "bread", quantityGenerated: 9 },
    });
    expect(outputResponse.statusCode).toBe(201);

    const completeResponse = await fastify.inject({ method: "POST", url: `/production-orders/${order.productionOrderId}/complete` });
    expect(completeResponse.statusCode).toBe(200);
    expect((completeResponse.json() as { status: string }).status).toBe("Completed");

    const cost = await fastify.inject({ method: "GET", url: `/production-orders/${order.productionOrderId}/total-consumed-cost` });
    expect((cost.json() as { totalConsumedCost: number }).totalConsumedCost).toBe(40);

    const quantity = await fastify.inject({ method: "GET", url: `/production-orders/${order.productionOrderId}/total-generated-quantity` });
    expect((quantity.json() as { totalGeneratedQuantity: number }).totalGeneratedQuantity).toBe(9);
    await fastify.close();
  });
});

describe("Rotas HTTP — Work Center", () => {
  it("POST /work-centers — 201; GET /work-centers/active lista apenas os criados (sempre active: true)", async () => {
    const fastify = await buildTestServer();
    const created = await fastify.inject({ method: "POST", url: "/work-centers", payload: { tenantId: "tenant-1", name: "Linha 1" } });
    expect(created.statusCode).toBe(201);
    expect((created.json() as { active: boolean }).active).toBe(true);

    const active = await fastify.inject({ method: "GET", url: "/work-centers/active" });
    expect(active.statusCode).toBe(200);
    expect((active.json() as unknown[]).length).toBe(1);
    await fastify.close();
  });

  it("POST /work-centers — 400, schema rejeita nome vazio (minLength: 1)", async () => {
    const fastify = await buildTestServer();
    const response = await fastify.inject({ method: "POST", url: "/work-centers", payload: { tenantId: "tenant-1", name: "" } });
    expect(response.statusCode).toBe(400);
    await fastify.close();
  });

  it("POST /work-centers — 422, nome apenas com espaços passa pelo schema (minLength: 1) mas é rejeitado pelo Core (InvalidWorkCenterNameError)", async () => {
    const fastify = await buildTestServer();
    const response = await fastify.inject({ method: "POST", url: "/work-centers", payload: { tenantId: "tenant-1", name: "   " } });
    expect(response.statusCode).toBe(422);
    await fastify.close();
  });
});

describe("Rotas HTTP — Auditoria de classes de bug conhecidas", () => {
  it("PATCH-clobber (IMP-203) — nenhuma superfície: nenhuma rota PATCH existe neste Hub", async () => {
    const fastify = await buildTestServer();
    for (const path of ["/bills-of-materials/x", "/production-orders/x", "/work-centers/x"]) {
      const response = await fastify.inject({ method: "PATCH", url: path, payload: {} });
      expect(response.statusCode).toBe(404);
    }
    await fastify.close();
  });

  it("FK second-write (IMP-303) — nenhuma superfície: consumptions/outputs regravados por completo nunca violam FOREIGN KEY em chamadas repetidas", async () => {
    const fastify = await buildTestServer();
    const bom = await createBillOfMaterials(fastify);
    const order = await createProductionOrder(fastify, bom.billOfMaterialsId, { plannedOutputQuantity: 100 });
    await fastify.inject({ method: "POST", url: `/production-orders/${order.productionOrderId}/start`, payload: { availableQuantities: { flour: 1000 } } });

    const first = await fastify.inject({
      method: "POST",
      url: `/production-orders/${order.productionOrderId}/consumptions`,
      payload: { inputProductId: "flour", quantityConsumed: 10, acquisitionCost: 5 },
    });
    expect(first.statusCode).toBe(201);

    const second = await fastify.inject({
      method: "POST",
      url: `/production-orders/${order.productionOrderId}/consumptions`,
      payload: { inputProductId: "flour", quantityConsumed: 10, acquisitionCost: 5 },
    });
    expect(second.statusCode).toBe(201);

    const found = await fastify.inject({ method: "GET", url: `/production-orders/${order.productionOrderId}` });
    expect((found.json() as { consumptions: unknown[] }).consumptions).toHaveLength(2);
    await fastify.close();
  });

  it("Ledger immutability (IMP-403) — não se aplica (ProductionOrder é máquina de estados); propriedade análoga verificada: nenhuma rota PUT/DELETE existe neste Hub", async () => {
    const fastify = await buildTestServer();
    for (const path of ["/bills-of-materials/x", "/production-orders/x", "/work-centers/x"]) {
      const put = await fastify.inject({ method: "PUT", url: path, payload: {} });
      expect(put.statusCode).toBe(404);
      const del = await fastify.inject({ method: "DELETE", url: path });
      expect(del.statusCode).toBe(404);
    }
    await fastify.close();
  });
});

describe("Rotas HTTP — OpenAPI", () => {
  it("expõe todos os dezessete endpoints com a tag 'production'", async () => {
    const fastify = await buildTestServer();
    const response = await fastify.inject({ method: "GET", url: "/documentation/json" });
    expect(response.statusCode).toBe(200);

    const doc = response.json() as { paths: Record<string, unknown>; tags: { name: string }[] };
    expect(doc.tags.map((tag) => tag.name)).toContain("production");

    expect(Object.keys(doc.paths)).toEqual(
      expect.arrayContaining([
        "/bills-of-materials",
        "/bills-of-materials/{billOfMaterialsId}/supersede",
        "/bills-of-materials/{billOfMaterialsId}",
        "/bills-of-materials/by-product/{outputProductId}/active",
        "/production-orders",
        "/production-orders/{productionOrderId}",
        "/production-orders/by-status/{status}",
        "/production-orders/by-origin/{orderId}",
        "/production-orders/{productionOrderId}/total-consumed-cost",
        "/production-orders/{productionOrderId}/total-generated-quantity",
        "/production-orders/{productionOrderId}/start",
        "/production-orders/{productionOrderId}/consumptions",
        "/production-orders/{productionOrderId}/outputs",
        "/production-orders/{productionOrderId}/complete",
        "/production-orders/{productionOrderId}/cancel",
        "/work-centers",
        "/work-centers/active",
      ]),
    );
    await fastify.close();
  });

  it("nenhum path deste Hub expõe PUT/PATCH/DELETE — nenhum Command permite escrita arbitrária sobre um Aggregate já existente", async () => {
    const fastify = await buildTestServer();
    const response = await fastify.inject({ method: "GET", url: "/documentation/json" });
    const doc = response.json() as { paths: Record<string, Record<string, unknown>> };

    const productionPaths = Object.keys(doc.paths).filter(
      (path) => path.startsWith("/bills-of-materials") || path.startsWith("/production-orders") || path.startsWith("/work-centers"),
    );
    expect(productionPaths.length).toBe(17);

    for (const path of productionPaths) {
      const methods = Object.keys(doc.paths[path]!);
      expect(methods).not.toContain("put");
      expect(methods).not.toContain("patch");
      expect(methods).not.toContain("delete");
    }
    await fastify.close();
  });
});
