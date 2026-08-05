import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { inventoryMovementClient } from "./inventoryMovementClient.js";
import { startRealApiServer, type RealApiServer } from "./testing/realApiServer.js";

/**
 * Integração real do Inventory Movement Hub — nenhum mock de `fetch`, chamada HTTP real contra uma
 * instância real de `apps/api` (Fastify + SQLite `:memory:`), per instrução explícita de IMP-404.
 * Servidor novo por teste, mesma disciplina de `purchaseClient.test.ts`/`supplierClient.test.ts`.
 */
describe("inventoryMovementClient — integração HTTP real (sem mock)", () => {
  let server: RealApiServer;

  beforeEach(async () => {
    server = await startRealApiServer();
  });

  afterEach(async () => {
    await server.close();
  });

  it("registerStockMovement -> listStockMovementsByProduct -> findStockPosition, fim a fim contra o servidor real", async () => {
    const registration = await inventoryMovementClient.registerStockMovement({
      tenantId: "tenant-1",
      productId: "product-1",
      quantityDelta: 10,
      origin: "Purchase",
      originReferenceId: "po-1",
    });
    expect(registration.movement.quantityDelta).toBe(10);
    expect(registration.position.quantityOnHand).toBe(10);

    const movements = await inventoryMovementClient.listStockMovementsByProduct("product-1");
    expect(movements).toHaveLength(1);

    const position = await inventoryMovementClient.findStockPosition("product-1");
    expect(position?.quantityOnHand).toBe(10);
  });

  it("registrar sequência de movimentos -> consultar histórico -> ordem cronológica preservada", async () => {
    await inventoryMovementClient.registerStockMovement({ tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" });
    await inventoryMovementClient.registerStockMovement({ tenantId: "tenant-1", productId: "product-1", quantityDelta: -3, origin: "SaleReturn" });
    await inventoryMovementClient.registerStockMovement({ tenantId: "tenant-1", productId: "product-1", quantityDelta: 5, origin: "Purchase", originReferenceId: "po-2" });

    const movements = await inventoryMovementClient.listStockMovementsByProduct("product-1");

    expect(movements.map((m) => m.quantityDelta)).toEqual([10, -3, 5]);
  });

  it("listStockMovementsByOriginReference filtra pela origem correta", async () => {
    await inventoryMovementClient.registerStockMovement({ tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" });
    await inventoryMovementClient.registerStockMovement({ tenantId: "tenant-1", productId: "product-2", quantityDelta: 3, origin: "Purchase", originReferenceId: "po-2" });

    const movements = await inventoryMovementClient.listStockMovementsByOriginReference("po-1");

    expect(movements).toHaveLength(1);
    expect(movements[0]?.productId).toBe("product-1");
  });

  it("findStockPosition devolve undefined (nunca lança) para um Produto nunca movimentado", async () => {
    const position = await inventoryMovementClient.findStockPosition("product-nunca-movimentado");

    expect(position).toBeUndefined();
  });

  it("createStockReservation -> findStockReservationById -> listStockReservationsByOrder -> releaseStockReservation, fim a fim contra o servidor real", async () => {
    await inventoryMovementClient.registerStockMovement({ tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" });

    const reservation = await inventoryMovementClient.createStockReservation({ tenantId: "tenant-1", productId: "product-1", quantity: 4, orderId: "order-1" });
    expect(reservation.status).toBe("Active");

    const found = await inventoryMovementClient.findStockReservationById(reservation.reservationId);
    expect(found?.reservationId).toBe(reservation.reservationId);

    const byOrder = await inventoryMovementClient.listStockReservationsByOrder("order-1");
    expect(byOrder).toHaveLength(1);

    const released = await inventoryMovementClient.releaseStockReservation(reservation.reservationId);
    expect(released.status).toBe("Released");
  });

  it("convertReservationToMovement gera um Stock Movement de saída e devolve a Position recalculada", async () => {
    await inventoryMovementClient.registerStockMovement({ tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" });
    const reservation = await inventoryMovementClient.createStockReservation({ tenantId: "tenant-1", productId: "product-1", quantity: 4, orderId: "order-1" });

    const conversion = await inventoryMovementClient.convertReservationToMovement(reservation.reservationId);

    expect(conversion.reservation.status).toBe("ConvertedToMovement");
    expect(conversion.movement.origin).toBe("SaleFulfillment");
    expect(conversion.position.quantityOnHand).toBe(6);
  });

  it("createStockLocation -> listActiveStockLocationsByTenant, fim a fim contra o servidor real", async () => {
    await inventoryMovementClient.createStockLocation({ tenantId: "tenant-1", name: "Depósito Central", address: { line: "Rua das Flores, 123" } });

    const locations = await inventoryMovementClient.listActiveStockLocationsByTenant("tenant-1");

    expect(locations).toHaveLength(1);
    expect(locations[0]?.address).toEqual({ line: "Rua das Flores, 123" });
  });

  it("createStockAlertRule -> deactivateStockAlertRule, fim a fim contra o servidor real", async () => {
    const rule = await inventoryMovementClient.createStockAlertRule({ tenantId: "tenant-1", productId: "product-1", thresholdQuantity: 5 });
    expect(rule.active).toBe(true);

    const deactivated = await inventoryMovementClient.deactivateStockAlertRule(rule.ruleId);
    expect(deactivated.active).toBe(false);
  });

  it("PRINCÍPIO DO LEDGER: nenhum método de edição/remoção/substituição de Stock Movement existe neste cliente", () => {
    const methodNames = Object.keys(inventoryMovementClient);

    expect(methodNames).not.toContain("updateStockMovement");
    expect(methodNames).not.toContain("deleteStockMovement");
    expect(methodNames).not.toContain("replaceStockMovement");
    expect(methodNames.some((name) => /movement/i.test(name) && /update|delete|replace|edit|remove/i.test(name))).toBe(false);
  });
});
