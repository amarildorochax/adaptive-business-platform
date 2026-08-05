import { describe, expect, it } from "vitest";
import { createDatabase } from "../db/client.js";
import { runMigrations } from "../db/migrate.js";
import { createTestDatabase } from "../testing/createTestDatabase.js";
import { createManagerRegistry } from "./createManagerRegistry.js";

describe("createManagerRegistry — a única alternância Fake/Real desta Sprint, centralizada", () => {
  it("mode 'fake' constrói os oito Managers sem exigir nenhuma DatabaseHandle", () => {
    const registry = createManagerRegistry("fake");

    expect(registry.businessProfile).toBeDefined();
    expect(registry.branding).toBeDefined();
    expect(registry.crm).toBeDefined();
    expect(registry.iam).toBeDefined();
    expect(registry.supplier).toBeDefined();
    expect(registry.purchase).toBeDefined();
    expect(registry.inventoryMovement).toBeDefined();
    expect(registry.production).toBeDefined();
  });

  it("mode 'real' sem DatabaseHandle lança erro explícito, nunca falha silenciosamente mais tarde", () => {
    expect(() => createManagerRegistry("real")).toThrow(/DatabaseHandle/);
  });

  it("mode 'real' constrói os quatro Managers sobre SQLite, e cada Command real produz dado que sobrevive à consulta subsequente", async () => {
    const handle = createTestDatabase();
    const registry = createManagerRegistry("real", handle);

    const profile = await registry.businessProfile.createBusinessProfile({ tenantId: "tenant-1", segment: "Floricultura", maturity: "elevada" });
    await registry.businessProfile.validateProfile(profile.result.profileId);
    await registry.businessProfile.finalizeInitialProfile(profile.result.profileId);

    const found = await registry.businessProfile.findProfile("tenant-1");
    expect(found.result?.profileId).toBe(profile.result.profileId);

    const stage = await registry.businessProfile.currentStage(profile.result.profileId);
    expect(stage.result).toBe("Perfil Inicial");

    handle.close();
  });

  it("mode 'real' — IAMManager: registerCredential -> login -> assignRole -> grantPermission -> authorize sobre SQLite", async () => {
    const handle = createTestDatabase();
    const registry = createManagerRegistry("real", handle);

    await registry.iam.registerCredential("identity-1", "Password", "hash-correto");
    const login = await registry.iam.login("identity-1", "tenant-1", "Password", "hash-correto");
    expect(login.result.session.identity).toBe("identity-1");

    await registry.iam.assignRole("identity-1", "tenant-1", "Financeiro");
    await registry.iam.grantPermission("Financeiro", "finance:approve");

    const decision = await registry.iam.authorize("identity-1", "tenant-1", "finance:approve");
    expect(decision.result.permitted).toBe(true);

    const context = await registry.iam.buildSecurityContext(login.result.session.sessionId);
    expect(context.result.roles).toEqual(["Financeiro"]);

    handle.close();
  });

  it("mode 'real' — SupplierManager: registerSupplier -> registerSupplierCatalogItem -> createSupplierContract -> recordSupplierPerformance sobre SQLite", async () => {
    const handle = createTestDatabase();
    const registry = createManagerRegistry("real", handle);

    const { result: supplier } = await registry.supplier.registerSupplier({
      tenantId: "tenant-1",
      legalName: "Floricultura Atacado Ltda.",
      taxId: { value: "12345678000199" },
    });

    await registry.supplier.addSupplierContact(supplier.supplierId, { name: "Maria Souza", role: "Commercial" });
    const { result: item } = await registry.supplier.registerSupplierCatalogItem({
      supplierId: supplier.supplierId,
      tenantId: "tenant-1",
      productId: "product-1",
      listPrice: { amount: 19.9, currencyCode: "BRL" },
      leadTimeInDays: 5,
      minimumOrderQuantity: 10,
    });
    await registry.supplier.createSupplierContract({
      supplierId: supplier.supplierId,
      tenantId: "tenant-1",
      startsAt: new Date("2026-01-01"),
      paymentTerms: { dueInDays: 30 },
    });
    const { result: performance } = await registry.supplier.recordSupplierPerformance({
      supplierId: supplier.supplierId,
      tenantId: "tenant-1",
      purchaseOrderId: "po-1",
      promisedAt: new Date("2026-01-10"),
      receivedAt: new Date("2026-01-09"),
      quantityOrdered: 100,
      quantityReceived: 100,
    });

    const found = await registry.supplier.getSupplier(supplier.supplierId);
    expect(found?.contacts).toHaveLength(1);
    expect(found?.contacts[0]?.name).toBe("Maria Souza");
    expect(item.productId).toBe("product-1");
    expect(performance.map((r) => r.observationType)).toEqual(["OnTimeDelivery", "QuantityMatch"]);

    handle.close();
  });

  it("mode 'real' — PurchaseManager: createPurchaseOrder -> addPurchaseOrderItem -> approvePurchaseOrder -> sendPurchaseOrderToSupplier -> registerReceiving sobre SQLite", async () => {
    const handle = createTestDatabase();
    const registry = createManagerRegistry("real", handle);

    const { result: created } = await registry.purchase.createPurchaseOrder({ tenantId: "tenant-1", supplierId: "supplier-1" });
    const { result: withItem } = await registry.purchase.addPurchaseOrderItem(created.purchaseOrderId, {
      productId: "product-1",
      quantityOrdered: 10,
      acquisitionCost: { amount: 10, currencyCode: "BRL" },
    });
    await registry.purchase.approvePurchaseOrder(created.purchaseOrderId, { limit: { amount: 1000, currencyCode: "BRL" } });
    await registry.purchase.sendPurchaseOrderToSupplier(created.purchaseOrderId);

    const itemId = withItem.items[0]!.purchaseOrderItemId;
    const { result: registration } = await registry.purchase.registerReceiving({
      purchaseOrderId: created.purchaseOrderId,
      tenantId: "tenant-1",
      lines: [{ purchaseOrderItemId: itemId, quantityReceived: 10 }],
      receivedAt: new Date("2026-02-01"),
    });

    expect(registration.purchaseOrder.status).toBe("Received");
    const found = await registry.purchase.getPurchaseOrder(created.purchaseOrderId);
    expect(found?.items[0]?.quantityReceived).toBe(10);

    handle.close();
  });

  it("mode 'real' — InventoryMovementManager: registerStockMovement -> createStockReservation -> convertReservationToMovement sobre SQLite", async () => {
    const handle = createTestDatabase();
    const registry = createManagerRegistry("real", handle);

    const { result: received } = await registry.inventoryMovement.registerStockMovement({
      tenantId: "tenant-1",
      productId: "product-1",
      quantityDelta: 10,
      origin: "Purchase",
      originReferenceId: "po-1",
    });
    expect(received.position.quantityOnHand).toBe(10);

    const { result: reservation } = await registry.inventoryMovement.createStockReservation({
      tenantId: "tenant-1",
      productId: "product-1",
      quantity: 4,
      orderId: "order-1",
    });
    expect(reservation.status).toBe("Active");

    const { result: conversion } = await registry.inventoryMovement.convertReservationToMovement(reservation.reservationId);
    expect(conversion.movement.origin).toBe("SaleFulfillment");
    expect(conversion.position.quantityOnHand).toBe(6);

    const found = await registry.inventoryMovement.getStockPosition("product-1");
    expect(found?.quantityOnHand).toBe(6);

    handle.close();
  });

  it("mode 'real' — ProductionManager: createBillOfMaterials -> createProductionOrder -> startProduction -> registerProductionConsumption -> registerProductionOutput -> completeProduction sobre SQLite", async () => {
    const handle = createTestDatabase();
    const registry = createManagerRegistry("real", handle);

    const { result: bom } = await registry.production.createBillOfMaterials({
      tenantId: "tenant-1",
      outputProductId: "bread",
      lines: [{ inputProductId: "flour", quantityPerOutputUnit: 2, unitOfMeasure: "Kilogram" }],
    });

    const { result: order } = await registry.production.createProductionOrder({
      tenantId: "tenant-1",
      billOfMaterialsId: bom.billOfMaterialsId,
      plannedOutputQuantity: 10,
    });

    const { result: started } = await registry.production.startProduction(order.productionOrderId, new Map([["flour", 20]]));
    expect(started.started).toBe(true);

    await registry.production.registerProductionConsumption(order.productionOrderId, {
      inputProductId: "flour",
      quantityConsumed: 20,
      acquisitionCost: 40,
    });
    await registry.production.registerProductionOutput(order.productionOrderId, {
      outputProductId: "bread",
      quantityGenerated: 9,
    });
    const { result: completed } = await registry.production.completeProduction(order.productionOrderId);

    expect(completed.status).toBe("Completed");
    const found = await registry.production.getProductionOrder(order.productionOrderId);
    expect(found?.consumptions).toHaveLength(1);
    expect(found?.outputs).toHaveLength(1);
    expect(await registry.production.getTotalConsumedCost(order.productionOrderId)).toBe(40);

    handle.close();
  });

  it("mode 'real' — dado criado por uma conexão sobrevive ao fechar e reabrir uma nova conexão contra o mesmo arquivo (a prova de persistência real)", async () => {
    const { mkdtempSync, rmSync } = await import("node:fs");
    const os = await import("node:os");
    const path = await import("node:path");

    const tempDir = mkdtempSync(path.join(os.tmpdir(), "abp-persistence-manager-test-"));
    const databasePath = path.join(tempDir, "test.sqlite3");

    try {
      const firstConnection = createDatabase({ environment: "testing", databasePath });
      runMigrations(firstConnection);
      const firstRegistry = createManagerRegistry("real", firstConnection);

      const theme = await firstRegistry.branding.generateInitialBrandIdentity({
        tenantId: "tenant-1",
        primaryColorHex: "#2E7D32",
        backgroundHex: "#FFFFFF",
        titleFont: "Poppins",
        bodyFont: "Inter",
      });
      firstConnection.close();

      const secondConnection = createDatabase({ environment: "testing", databasePath });
      const secondRegistry = createManagerRegistry("real", secondConnection);

      const rehydrated = await secondRegistry.branding.currentTheme("tenant-1");
      expect(rehydrated.result?.themeId).toBe(theme.result.theme.themeId);
      secondConnection.close();
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
