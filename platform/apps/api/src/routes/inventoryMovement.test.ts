import { describe, expect, it } from "vitest";
import { buildTestServer } from "../testing/buildTestServer.js";

describe("Rotas HTTP do Inventory Movement Hub — Stock Movement (o ledger)", () => {
  it("fluxo completo via HTTP real: registerStockMovement -> HTTP 201 -> consultar por Produto -> HTTP 200 -> Stock Position recalculada", async () => {
    const fastify = await buildTestServer();

    const registered = await fastify.inject({
      method: "POST",
      url: "/stock-movements",
      payload: { tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" },
    });
    expect(registered.statusCode).toBe(201);
    const registeredBody = registered.json() as { movement: { movementId: string; quantityDelta: number }; position: { quantityOnHand: number } };
    expect(registeredBody.movement.quantityDelta).toBe(10);
    expect(registeredBody.position.quantityOnHand).toBe(10);

    const movements = await fastify.inject({ method: "GET", url: "/stock-movements/by-product/product-1" });
    expect(movements.statusCode).toBe(200);
    expect(movements.json()).toHaveLength(1);

    const position = await fastify.inject({ method: "GET", url: "/stock-positions/product-1" });
    expect(position.statusCode).toBe(200);
    expect((position.json() as { quantityOnHand: number }).quantityOnHand).toBe(10);

    await fastify.close();
  });

  it("registrar sequência de movimentos -> consultar histórico -> ordem cronológica e integridade preservadas", async () => {
    const fastify = await buildTestServer();

    await fastify.inject({ method: "POST", url: "/stock-movements", payload: { tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" } });
    await fastify.inject({ method: "POST", url: "/stock-movements", payload: { tenantId: "tenant-1", productId: "product-1", quantityDelta: -3, origin: "SaleReturn" } });
    await fastify.inject({ method: "POST", url: "/stock-movements", payload: { tenantId: "tenant-1", productId: "product-1", quantityDelta: 5, origin: "Purchase", originReferenceId: "po-2" } });

    const response = await fastify.inject({ method: "GET", url: "/stock-movements/by-product/product-1" });
    const movements = response.json() as { quantityDelta: number; occurredAt: string }[];

    expect(movements).toHaveLength(3);
    expect(movements.map((m) => m.quantityDelta)).toEqual([10, -3, 5]);
    expect(new Date(movements[0]!.occurredAt).getTime()).toBeLessThanOrEqual(new Date(movements[2]!.occurredAt).getTime());
    expect(movements.reduce((sum, m) => sum + m.quantityDelta, 0)).toBe(12);

    await fastify.close();
  });

  it("by-origin-reference retorna apenas as movimentações do Purchase Order de origem", async () => {
    const fastify = await buildTestServer();

    await fastify.inject({ method: "POST", url: "/stock-movements", payload: { tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" } });
    await fastify.inject({ method: "POST", url: "/stock-movements", payload: { tenantId: "tenant-1", productId: "product-2", quantityDelta: 3, origin: "Purchase", originReferenceId: "po-2" } });

    const response = await fastify.inject({ method: "GET", url: "/stock-movements/by-origin-reference/po-1" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveLength(1);

    await fastify.close();
  });

  it("400 — registrar sem 'productId' (obrigatório) é rejeitado pela validação de schema", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({
      method: "POST",
      url: "/stock-movements",
      payload: { tenantId: "tenant-1", quantityDelta: 10, origin: "Purchase" },
    });

    expect(response.statusCode).toBe(400);
    await fastify.close();
  });

  it("400 — origin fora do enum fechado é rejeitado pela validação de schema", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({
      method: "POST",
      url: "/stock-movements",
      payload: { tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "OrigemInventada" },
    });

    expect(response.statusCode).toBe(400);
    await fastify.close();
  });

  it("422 — quantityDelta zero é aceito pelo schema mas rejeitado pelo Core (InvalidQuantityDeltaError)", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({
      method: "POST",
      url: "/stock-movements",
      payload: { tenantId: "tenant-1", productId: "product-1", quantityDelta: 0, origin: "ManualAdjustment" },
    });

    expect(response.statusCode).toBe(422);
    await fastify.close();
  });

  it("422 — origin ProductionOutput sem originReferenceId (MovementOriginReferenceRequiredError)", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({
      method: "POST",
      url: "/stock-movements",
      payload: { tenantId: "tenant-1", productId: "product-1", quantityDelta: 5, origin: "ProductionOutput" },
    });

    expect(response.statusCode).toBe(422);
    await fastify.close();
  });

  it("404 — Stock Position de um Produto nunca movimentado", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "GET", url: "/stock-positions/product-nunca-movimentado" });

    expect(response.statusCode).toBe(404);
    await fastify.close();
  });

  it("GET /stock-movements/by-product/:productId?locationId= isola por localização", async () => {
    const fastify = await buildTestServer();

    await fastify.inject({ method: "POST", url: "/stock-movements", payload: { tenantId: "tenant-1", productId: "product-1", locationId: "location-a", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" } });
    await fastify.inject({ method: "POST", url: "/stock-movements", payload: { tenantId: "tenant-1", productId: "product-1", locationId: "location-b", quantityDelta: 4, origin: "Purchase", originReferenceId: "po-2" } });

    const responseA = await fastify.inject({ method: "GET", url: "/stock-movements/by-product/product-1?locationId=location-a" });
    expect(responseA.json()).toHaveLength(1);

    await fastify.close();
  });
});

describe("Rotas HTTP — Princípio do Ledger: nenhuma operação de alteração ou remoção existe", () => {
  it("registrar movimento -> tentar atualizar via PUT -> endpoint inexistente (404)", async () => {
    const fastify = await buildTestServer();
    const created = await fastify.inject({ method: "POST", url: "/stock-movements", payload: { tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" } });
    const movementId = (created.json() as { movement: { movementId: string } }).movement.movementId;

    const attempt = await fastify.inject({ method: "PUT", url: `/stock-movements/${movementId}`, payload: { quantityDelta: 999 } });

    expect(attempt.statusCode).toBe(404);

    const stillThere = await fastify.inject({ method: "GET", url: "/stock-movements/by-product/product-1" });
    expect((stillThere.json() as { quantityDelta: number }[])[0]?.quantityDelta).toBe(10);
    await fastify.close();
  });

  it("registrar movimento -> tentar atualizar via PATCH -> endpoint inexistente (404)", async () => {
    const fastify = await buildTestServer();
    const created = await fastify.inject({ method: "POST", url: "/stock-movements", payload: { tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" } });
    const movementId = (created.json() as { movement: { movementId: string } }).movement.movementId;

    const attempt = await fastify.inject({ method: "PATCH", url: `/stock-movements/${movementId}`, payload: { quantityDelta: 999 } });

    expect(attempt.statusCode).toBe(404);
    await fastify.close();
  });

  it("registrar movimento -> tentar remover via DELETE -> endpoint inexistente (404)", async () => {
    const fastify = await buildTestServer();
    const created = await fastify.inject({ method: "POST", url: "/stock-movements", payload: { tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" } });
    const movementId = (created.json() as { movement: { movementId: string } }).movement.movementId;

    const attempt = await fastify.inject({ method: "DELETE", url: `/stock-movements/${movementId}` });

    expect(attempt.statusCode).toBe(404);

    const stillThere = await fastify.inject({ method: "GET", url: "/stock-movements/by-product/product-1" });
    expect(stillThere.json()).toHaveLength(1);
    await fastify.close();
  });

  it("PUT/DELETE contra a coleção /stock-movements (sem id) também não existem", async () => {
    const fastify = await buildTestServer();

    const put = await fastify.inject({ method: "PUT", url: "/stock-movements" });
    const del = await fastify.inject({ method: "DELETE", url: "/stock-movements" });

    expect(put.statusCode).toBe(404);
    expect(del.statusCode).toBe(404);
    await fastify.close();
  });
});

describe("Rotas HTTP — Stock Reservation", () => {
  it("fluxo completo: registra estoque -> cria Reservation -> consulta por id -> consulta por Order -> libera", async () => {
    const fastify = await buildTestServer();
    await fastify.inject({ method: "POST", url: "/stock-movements", payload: { tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" } });

    const created = await fastify.inject({
      method: "POST",
      url: "/stock-reservations",
      payload: { tenantId: "tenant-1", productId: "product-1", quantity: 4, orderId: "order-1" },
    });
    expect(created.statusCode).toBe(201);
    const reservation = created.json() as { reservationId: string; status: string };
    expect(reservation.status).toBe("Active");

    const found = await fastify.inject({ method: "GET", url: `/stock-reservations/${reservation.reservationId}` });
    expect(found.statusCode).toBe(200);

    const byOrder = await fastify.inject({ method: "GET", url: "/stock-reservations/by-order/order-1" });
    expect(byOrder.statusCode).toBe(200);
    expect(byOrder.json()).toHaveLength(1);

    const released = await fastify.inject({ method: "POST", url: `/stock-reservations/${reservation.reservationId}/release` });
    expect(released.statusCode).toBe(200);
    expect((released.json() as { status: string }).status).toBe("Released");

    await fastify.close();
  });

  it("convertReservationToMovement gera um Stock Movement de saída (SaleFulfillment) e devolve a Position recalculada", async () => {
    const fastify = await buildTestServer();
    await fastify.inject({ method: "POST", url: "/stock-movements", payload: { tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" } });
    const created = await fastify.inject({
      method: "POST",
      url: "/stock-reservations",
      payload: { tenantId: "tenant-1", productId: "product-1", quantity: 4, orderId: "order-1" },
    });
    const reservation = created.json() as { reservationId: string };

    const converted = await fastify.inject({ method: "POST", url: `/stock-reservations/${reservation.reservationId}/convert` });

    expect(converted.statusCode).toBe(200);
    const body = converted.json() as { reservation: { status: string }; movement: { origin: string; quantityDelta: number }; position: { quantityOnHand: number } };
    expect(body.reservation.status).toBe("ConvertedToMovement");
    expect(body.movement.origin).toBe("SaleFulfillment");
    expect(body.movement.quantityDelta).toBe(-4);
    expect(body.position.quantityOnHand).toBe(6);

    await fastify.close();
  });

  it("400 — criar Reservation com quantity zero é rejeitado pela validação de schema", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({
      method: "POST",
      url: "/stock-reservations",
      payload: { tenantId: "tenant-1", productId: "product-1", quantity: 0, orderId: "order-1" },
    });

    expect(response.statusCode).toBe(400);
    await fastify.close();
  });

  it("422 — criar Reservation acima da quantidade disponível (StockReservationExceedsAvailableError)", async () => {
    const fastify = await buildTestServer();
    await fastify.inject({ method: "POST", url: "/stock-movements", payload: { tenantId: "tenant-1", productId: "product-1", quantityDelta: 5, origin: "Purchase", originReferenceId: "po-1" } });

    const response = await fastify.inject({
      method: "POST",
      url: "/stock-reservations",
      payload: { tenantId: "tenant-1", productId: "product-1", quantity: 6, orderId: "order-1" },
    });

    expect(response.statusCode).toBe(422);
    await fastify.close();
  });

  it("404 — buscar/liberar/converter uma Stock Reservation inexistente", async () => {
    const fastify = await buildTestServer();

    const get = await fastify.inject({ method: "GET", url: "/stock-reservations/reservation-inexistente" });
    const release = await fastify.inject({ method: "POST", url: "/stock-reservations/reservation-inexistente/release" });
    const convert = await fastify.inject({ method: "POST", url: "/stock-reservations/reservation-inexistente/convert" });

    expect(get.statusCode).toBe(404);
    expect(release.statusCode).toBe(404);
    expect(convert.statusCode).toBe(404);
    await fastify.close();
  });

  it("409 — liberar uma Stock Reservation já convertida em Movement", async () => {
    const fastify = await buildTestServer();
    await fastify.inject({ method: "POST", url: "/stock-movements", payload: { tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" } });
    const created = await fastify.inject({ method: "POST", url: "/stock-reservations", payload: { tenantId: "tenant-1", productId: "product-1", quantity: 4, orderId: "order-1" } });
    const reservation = created.json() as { reservationId: string };
    await fastify.inject({ method: "POST", url: `/stock-reservations/${reservation.reservationId}/convert` });

    const response = await fastify.inject({ method: "POST", url: `/stock-reservations/${reservation.reservationId}/release` });

    expect(response.statusCode).toBe(409);
    await fastify.close();
  });
});

describe("Rotas HTTP — Stock Location", () => {
  it("cria com endereço, e lista apenas Location ativa do Tenant", async () => {
    const fastify = await buildTestServer();

    const created = await fastify.inject({
      method: "POST",
      url: "/stock-locations",
      payload: { tenantId: "tenant-1", name: "Depósito Central", address: { line: "Rua das Flores, 123" } },
    });
    expect(created.statusCode).toBe(201);
    const location = created.json() as { locationId: string; address: { line: string }; active: boolean };
    expect(location.address).toEqual({ line: "Rua das Flores, 123" });
    expect(location.active).toBe(true);

    const list = await fastify.inject({ method: "GET", url: "/stock-locations/by-tenant/tenant-1/active" });
    expect(list.statusCode).toBe(200);
    expect(list.json()).toHaveLength(1);

    await fastify.close();
  });

  it("cria sem endereço — address ausente no corpo de resposta", async () => {
    const fastify = await buildTestServer();

    const created = await fastify.inject({ method: "POST", url: "/stock-locations", payload: { tenantId: "tenant-1", name: "Depósito Central" } });

    expect(created.statusCode).toBe(201);
    expect((created.json() as { address?: unknown }).address).toBeUndefined();
    await fastify.close();
  });

  it("400 — criar Location sem 'name' (obrigatório) é rejeitado pela validação de schema", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "POST", url: "/stock-locations", payload: { tenantId: "tenant-1" } });

    expect(response.statusCode).toBe(400);
    await fastify.close();
  });
});

describe("Rotas HTTP — Stock Alert Rule", () => {
  it("cria e desativa uma Stock Alert Rule", async () => {
    const fastify = await buildTestServer();

    const created = await fastify.inject({
      method: "POST",
      url: "/stock-alert-rules",
      payload: { tenantId: "tenant-1", productId: "product-1", thresholdQuantity: 5 },
    });
    expect(created.statusCode).toBe(201);
    const rule = created.json() as { ruleId: string; active: boolean };
    expect(rule.active).toBe(true);

    const deactivated = await fastify.inject({ method: "POST", url: `/stock-alert-rules/${rule.ruleId}/deactivate` });
    expect(deactivated.statusCode).toBe(200);
    expect((deactivated.json() as { active: boolean }).active).toBe(false);

    await fastify.close();
  });

  it("404 — desativar uma Stock Alert Rule inexistente", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "POST", url: "/stock-alert-rules/rule-inexistente/deactivate" });

    expect(response.statusCode).toBe(404);
    await fastify.close();
  });

  it("400 — criar Stock Alert Rule sem 'thresholdQuantity' (obrigatório) é rejeitado pela validação de schema", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "POST", url: "/stock-alert-rules", payload: { tenantId: "tenant-1", productId: "product-1" } });

    expect(response.statusCode).toBe(400);
    await fastify.close();
  });
});

describe("Rotas HTTP — OpenAPI", () => {
  it("expõe todos os treze endpoints com a tag 'inventory-movement'", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "GET", url: "/documentation/json" });
    expect(response.statusCode).toBe(200);

    const doc = response.json() as { paths: Record<string, unknown>; tags: { name: string }[] };
    expect(doc.tags.map((tag) => tag.name)).toContain("inventory-movement");
    expect(Object.keys(doc.paths)).toEqual(
      expect.arrayContaining([
        "/stock-movements",
        "/stock-movements/by-product/{productId}",
        "/stock-movements/by-origin-reference/{originReferenceId}",
        "/stock-positions/{productId}",
        "/stock-reservations",
        "/stock-reservations/{reservationId}",
        "/stock-reservations/by-order/{orderId}",
        "/stock-reservations/{reservationId}/release",
        "/stock-reservations/{reservationId}/convert",
        "/stock-locations",
        "/stock-locations/by-tenant/{tenantId}/active",
        "/stock-alert-rules",
        "/stock-alert-rules/{ruleId}/deactivate",
      ]),
    );

    await fastify.close();
  });

  it("nenhum path documentado expõe PUT/PATCH/DELETE sobre /stock-movements — o ledger nunca é editável nem removível pela própria definição OpenAPI", async () => {
    const fastify = await buildTestServer();

    const response = await fastify.inject({ method: "GET", url: "/documentation/json" });
    const doc = response.json() as { paths: Record<string, Record<string, unknown>> };

    const movementPaths = Object.keys(doc.paths).filter((path) => path.startsWith("/stock-movements"));
    for (const path of movementPaths) {
      const methods = Object.keys(doc.paths[path]!);
      expect(methods).not.toContain("put");
      expect(methods).not.toContain("patch");
      expect(methods).not.toContain("delete");
    }

    await fastify.close();
  });
});
