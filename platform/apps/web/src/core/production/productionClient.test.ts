import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { productionClient } from "./productionClient.js";
import { startRealApiServer, type RealApiServer } from "./testing/realApiServer.js";

/**
 * Integração real do Production Hub — nenhum mock de `fetch`, chamada HTTP real contra uma instância
 * real de `apps/api` (Fastify + SQLite `:memory:`), per instrução explícita desta Sprint ("Sem mocks
 * para integração"). Servidor novo por teste, mesma disciplina de
 * `inventoryMovementClient.test.ts`/`purchaseClient.test.ts`/`supplierClient.test.ts`.
 */
describe("productionClient — integração HTTP real (sem mock)", () => {
  let server: RealApiServer;

  beforeEach(async () => {
    server = await startRealApiServer();
  });

  afterEach(async () => {
    await server.close();
  });

  it("createBillOfMaterials -> findBillOfMaterialsById -> findActiveBillOfMaterialsForProduct, fim a fim contra o servidor real", async () => {
    const bom = await productionClient.createBillOfMaterials({
      tenantId: "tenant-1",
      outputProductId: "bread",
      lines: [{ inputProductId: "flour", quantityPerOutputUnit: 2, unitOfMeasure: "Kilogram" }],
    });
    expect(bom.version).toBe(1);
    expect(bom.status).toBe("Active");

    const found = await productionClient.findBillOfMaterialsById(bom.billOfMaterialsId);
    expect(found?.billOfMaterialsId).toBe(bom.billOfMaterialsId);

    const active = await productionClient.findActiveBillOfMaterialsForProduct("bread");
    expect(active?.billOfMaterialsId).toBe(bom.billOfMaterialsId);
  });

  it("findBillOfMaterialsById/findActiveBillOfMaterialsForProduct devolvem undefined (nunca lançam) quando ausentes", async () => {
    expect(await productionClient.findBillOfMaterialsById("does-not-exist")).toBeUndefined();
    expect(await productionClient.findActiveBillOfMaterialsForProduct("does-not-exist")).toBeUndefined();
  });

  it("supersedeBillOfMaterials marca a corrente Superseded e cria a próxima versão já Active", async () => {
    const bom = await productionClient.createBillOfMaterials({
      tenantId: "tenant-1",
      outputProductId: "bread",
      lines: [{ inputProductId: "flour", quantityPerOutputUnit: 2, unitOfMeasure: "Kilogram" }],
    });

    const result = await productionClient.supersedeBillOfMaterials(bom.billOfMaterialsId, {
      lines: [{ inputProductId: "flour", quantityPerOutputUnit: 3, unitOfMeasure: "Kilogram" }],
    });

    expect(result.previous.status).toBe("Superseded");
    expect(result.next.status).toBe("Active");
    expect(result.next.version).toBe(2);
  });

  it("fluxo completo: createProductionOrder -> findProductionOrderById -> listByStatus/listByOrigin -> start -> consumptions -> outputs -> complete -> totais", async () => {
    const bom = await productionClient.createBillOfMaterials({
      tenantId: "tenant-1",
      outputProductId: "bread",
      lines: [{ inputProductId: "flour", quantityPerOutputUnit: 2, unitOfMeasure: "Kilogram" }],
    });

    const order = await productionClient.createProductionOrder({
      tenantId: "tenant-1",
      billOfMaterialsId: bom.billOfMaterialsId,
      plannedOutputQuantity: 10,
      orderId: "order-1",
    });
    expect(order.status).toBe("Planned");

    const found = await productionClient.findProductionOrderById(order.productionOrderId);
    expect(found?.productionOrderId).toBe(order.productionOrderId);

    const byStatus = await productionClient.listProductionOrdersByStatus("Planned");
    expect(byStatus.map((o) => o.productionOrderId)).toContain(order.productionOrderId);

    const byOrigin = await productionClient.listProductionOrdersByOrigin("order-1");
    expect(byOrigin.map((o) => o.productionOrderId)).toEqual([order.productionOrderId]);

    const started = await productionClient.startProduction(order.productionOrderId, { availableQuantities: { flour: 20 } });
    expect(started.started).toBe(true);
    expect(started.productionOrder.status).toBe("InProgress");

    const consumption = await productionClient.registerProductionConsumption(order.productionOrderId, {
      inputProductId: "flour",
      quantityConsumed: 20,
      acquisitionCost: 40,
    });
    expect(consumption.productionOrder.consumptions).toHaveLength(1);

    const output = await productionClient.registerProductionOutput(order.productionOrderId, {
      outputProductId: "bread",
      quantityGenerated: 9,
    });
    expect(output.productionOrder.outputs).toHaveLength(1);

    const completed = await productionClient.completeProduction(order.productionOrderId);
    expect(completed.status).toBe("Completed");

    const totalCost = await productionClient.getTotalConsumedCost(order.productionOrderId);
    expect(totalCost.totalConsumedCost).toBe(40);

    const totalQuantity = await productionClient.getTotalGeneratedQuantity(order.productionOrderId);
    expect(totalQuantity.totalGeneratedQuantity).toBe(9);
  });

  it("startProduction com insumo insuficiente devolve started: false, sem lançar erro", async () => {
    const bom = await productionClient.createBillOfMaterials({
      tenantId: "tenant-1",
      outputProductId: "bread",
      lines: [{ inputProductId: "flour", quantityPerOutputUnit: 2, unitOfMeasure: "Kilogram" }],
    });
    const order = await productionClient.createProductionOrder({ tenantId: "tenant-1", billOfMaterialsId: bom.billOfMaterialsId, plannedOutputQuantity: 10 });

    const started = await productionClient.startProduction(order.productionOrderId, { availableQuantities: { flour: 1 } });

    expect(started.started).toBe(false);
    expect(started.productionOrder.status).toBe("Planned");
  });

  it("cancelProduction cancela antes de qualquer consumo, com o motivo preservado", async () => {
    const bom = await productionClient.createBillOfMaterials({
      tenantId: "tenant-1",
      outputProductId: "bread",
      lines: [{ inputProductId: "flour", quantityPerOutputUnit: 2, unitOfMeasure: "Kilogram" }],
    });
    const order = await productionClient.createProductionOrder({ tenantId: "tenant-1", billOfMaterialsId: bom.billOfMaterialsId, plannedOutputQuantity: 10 });

    const cancelled = await productionClient.cancelProduction(order.productionOrderId, { reason: "Cliente desistiu" });

    expect(cancelled.status).toBe("Cancelled");
    expect(cancelled.cancelReason).toBe("Cliente desistiu");
  });

  it("getTotalConsumedCost/getTotalGeneratedQuantity propagam erro real (nunca undefined) para um id inexistente", async () => {
    await expect(productionClient.getTotalConsumedCost("does-not-exist")).rejects.toThrow();
    await expect(productionClient.getTotalGeneratedQuantity("does-not-exist")).rejects.toThrow();
  });

  it("createWorkCenter -> listActiveWorkCenters, fim a fim contra o servidor real", async () => {
    const workCenter = await productionClient.createWorkCenter({ tenantId: "tenant-1", name: "Linha 1" });
    expect(workCenter.active).toBe(true);

    const active = await productionClient.listActiveWorkCenters();
    expect(active.map((w) => w.workCenterId)).toContain(workCenter.workCenterId);
  });

  it("FK second-write (auditoria IMP-503, verificada de novo neste cliente): duas chamadas consecutivas de registerProductionConsumption nunca falham", async () => {
    const bom = await productionClient.createBillOfMaterials({
      tenantId: "tenant-1",
      outputProductId: "bread",
      lines: [{ inputProductId: "flour", quantityPerOutputUnit: 2, unitOfMeasure: "Kilogram" }],
    });
    const order = await productionClient.createProductionOrder({ tenantId: "tenant-1", billOfMaterialsId: bom.billOfMaterialsId, plannedOutputQuantity: 100 });
    await productionClient.startProduction(order.productionOrderId, { availableQuantities: { flour: 1000 } });

    await productionClient.registerProductionConsumption(order.productionOrderId, { inputProductId: "flour", quantityConsumed: 10, acquisitionCost: 5 });
    const second = await productionClient.registerProductionConsumption(order.productionOrderId, { inputProductId: "flour", quantityConsumed: 10, acquisitionCost: 5 });

    expect(second.productionOrder.consumptions).toHaveLength(2);
  });

  it("PATCH-clobber: nenhum método deste cliente corresponde a uma atualização parcial", () => {
    const methodNames = Object.keys(productionClient);
    expect(methodNames.some((name) => /^(update|patch)/i.test(name))).toBe(false);
  });
});
