import type { PurchaseOrder, PurchaseRequisition, ReorderRule } from "@abp/purchase-hub";
import { describe, expect, it } from "vitest";
import { createDatabase } from "../../db/client.js";
import { runMigrations } from "../../db/migrate.js";
import { createTestDatabase } from "../../testing/createTestDatabase.js";
import { SqlitePurchaseOrderRepository } from "./SqlitePurchaseOrderRepository.js";
import { SqlitePurchaseRequisitionRepository } from "./SqlitePurchaseRequisitionRepository.js";
import { SqliteReceivingRepository } from "./SqliteReceivingRepository.js";
import { SqliteReorderRuleRepository } from "./SqliteReorderRuleRepository.js";

function buildPurchaseOrder(overrides: Partial<PurchaseOrder> = {}): PurchaseOrder {
  const now = new Date("2026-01-01T12:00:00.000Z");
  return {
    purchaseOrderId: "po-1",
    tenantId: "tenant-1",
    supplierId: "supplier-1",
    status: "Draft",
    items: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function buildRequisition(overrides: Partial<PurchaseRequisition> = {}): PurchaseRequisition {
  const now = new Date("2026-01-01T12:00:00.000Z");
  return {
    requisitionId: "req-1",
    tenantId: "tenant-1",
    origin: "Manual",
    lines: [{ productId: "product-1", suggestedQuantity: 30 }],
    status: "Open",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function buildRule(overrides: Partial<ReorderRule> = {}): ReorderRule {
  const now = new Date("2026-01-01T12:00:00.000Z");
  return {
    ruleId: "rule-1",
    tenantId: "tenant-1",
    productId: "product-1",
    thresholdQuantity: 10,
    reorderQuantity: 50,
    active: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("SqlitePurchaseOrderRepository — CRUD completo", () => {
  it("cria, recupera por id, e persiste items embutidos (parte interna do Aggregate)", async () => {
    const handle = createTestDatabase();
    const repository = new SqlitePurchaseOrderRepository(handle.db);

    const purchaseOrder = buildPurchaseOrder({
      status: "PendingApproval",
      items: [
        {
          purchaseOrderItemId: "item-1",
          purchaseOrderId: "po-1",
          productId: "product-1",
          quantityOrdered: 10,
          quantityReceived: 0,
          acquisitionCost: { amount: 10, currencyCode: "BRL" },
          status: "Pending",
        },
      ],
    });
    await repository.create(purchaseOrder);

    const found = await repository.findById("po-1");
    expect(found?.status).toBe("PendingApproval");
    expect(found?.items).toHaveLength(1);
    expect(found?.items[0]?.acquisitionCost.amount).toBe(10);
    handle.close();
  });

  it("update altera status e regrava a lista de items por completo, sem duplicar os antigos", async () => {
    const handle = createTestDatabase();
    const repository = new SqlitePurchaseOrderRepository(handle.db);
    const purchaseOrder = await repository.create(
      buildPurchaseOrder({
        items: [
          {
            purchaseOrderItemId: "item-1",
            purchaseOrderId: "po-1",
            productId: "product-1",
            quantityOrdered: 10,
            quantityReceived: 0,
            acquisitionCost: { amount: 10, currencyCode: "BRL" },
            status: "Pending",
          },
        ],
      }),
    );

    await repository.update({
      ...purchaseOrder,
      status: "Sent",
      items: [{ ...purchaseOrder.items[0]!, quantityReceived: 4, status: "PartiallyReceived" }],
    });

    const found = await repository.findById("po-1");
    expect(found?.status).toBe("Sent");
    expect(found?.items).toHaveLength(1);
    expect(found?.items[0]?.quantityReceived).toBe(4);
    handle.close();
  });

  it("findBySupplier, findByStatus e findOpen refletem o estado real, isolados por Tenant/Supplier", async () => {
    const handle = createTestDatabase();
    const repository = new SqlitePurchaseOrderRepository(handle.db);

    await repository.create(buildPurchaseOrder({ purchaseOrderId: "po-1", status: "Draft" }));
    await repository.create(buildPurchaseOrder({ purchaseOrderId: "po-2", status: "Received" }));
    await repository.create(buildPurchaseOrder({ purchaseOrderId: "po-3", supplierId: "supplier-2", status: "Cancelled" }));

    expect((await repository.findBySupplier("supplier-1")).map((po) => po.purchaseOrderId).sort()).toEqual(["po-1", "po-2"]);
    expect((await repository.findByStatus("tenant-1", "Received")).map((po) => po.purchaseOrderId)).toEqual(["po-2"]);
    expect((await repository.findOpen("tenant-1")).map((po) => po.purchaseOrderId)).toEqual(["po-1"]);
    handle.close();
  });
});

describe("SqlitePurchaseOrderRepository — Constraints e Foreign Keys", () => {
  it("rejeita um purchase_order_items referenciando um purchase_order_id inexistente — FOREIGN KEY ativa", () => {
    const handle = createTestDatabase();

    expect(() =>
      handle.db
        .prepare(
          "INSERT INTO purchase_order_items (purchase_order_item_id, purchase_order_id, product_id, quantity_ordered, quantity_received, acquisition_cost_amount, acquisition_cost_currency_code, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .run("item-orfao", "po-inexistente", "product-1", 1, 0, 1, "BRL", "Pending"),
    ).toThrow();
    handle.close();
  });

  it("rejeita um Purchase Order referenciando um requisition_id inexistente — primeira FOREIGN KEY entre dois Aggregate Roots desta plataforma", async () => {
    const handle = createTestDatabase();
    const repository = new SqlitePurchaseOrderRepository(handle.db);

    await expect(repository.create(buildPurchaseOrder({ requisitionId: "req-inexistente" }))).rejects.toThrow();
    handle.close();
  });
});

describe("SqlitePurchaseOrderRepository — Rollback (atomicidade)", () => {
  it("create reverte o Purchase Order já inserido quando a inserção de um item falha na mesma transação", async () => {
    const handle = createTestDatabase();
    const repository = new SqlitePurchaseOrderRepository(handle.db);

    const malformed = buildPurchaseOrder({
      purchaseOrderId: "po-rollback",
      items: [
        {
          purchaseOrderItemId: "item-dup",
          purchaseOrderId: "po-rollback",
          productId: "product-1",
          quantityOrdered: 10,
          quantityReceived: 0,
          acquisitionCost: { amount: 10, currencyCode: "BRL" },
          status: "Pending",
        },
        {
          purchaseOrderItemId: "item-dup",
          purchaseOrderId: "po-rollback",
          productId: "product-2",
          quantityOrdered: 5,
          quantityReceived: 0,
          acquisitionCost: { amount: 5, currencyCode: "BRL" },
          status: "Pending",
        },
      ],
    });

    await expect(repository.create(malformed)).rejects.toThrow();

    const rawRow = handle.db.prepare("SELECT * FROM purchase_orders WHERE purchase_order_id = ?").get("po-rollback");
    expect(rawRow).toBeUndefined();
    handle.close();
  });

  it("update reverte por completo quando falha — nenhuma alteração parcial permanece gravada", async () => {
    const handle = createTestDatabase();
    const repository = new SqlitePurchaseOrderRepository(handle.db);
    const purchaseOrder = await repository.create(buildPurchaseOrder());

    await expect(
      repository.update({
        ...purchaseOrder,
        status: "Cancelled",
        items: [
          {
            purchaseOrderItemId: "item-dup",
            purchaseOrderId: purchaseOrder.purchaseOrderId,
            productId: "product-1",
            quantityOrdered: 1,
            quantityReceived: 0,
            acquisitionCost: { amount: 1, currencyCode: "BRL" },
            status: "Pending",
          },
          {
            purchaseOrderItemId: "item-dup",
            purchaseOrderId: purchaseOrder.purchaseOrderId,
            productId: "product-2",
            quantityOrdered: 1,
            quantityReceived: 0,
            acquisitionCost: { amount: 1, currencyCode: "BRL" },
            status: "Pending",
          },
        ],
      }),
    ).rejects.toThrow();

    const found = await repository.findById(purchaseOrder.purchaseOrderId);
    expect(found?.status).toBe("Draft");
    handle.close();
  });
});

describe("SqlitePurchaseOrderRepository — Persistência entre conexões", () => {
  it("dado criado por uma conexão sobrevive ao fechar e reabrir uma nova conexão contra o mesmo arquivo", async () => {
    const { mkdtempSync, rmSync } = await import("node:fs");
    const os = await import("node:os");
    const path = await import("node:path");

    const tempDir = mkdtempSync(path.join(os.tmpdir(), "abp-purchase-persistence-test-"));
    const databasePath = path.join(tempDir, "test.sqlite3");

    try {
      const firstConnection = createDatabase({ environment: "testing", databasePath });
      runMigrations(firstConnection);
      const firstRepository = new SqlitePurchaseOrderRepository(firstConnection.db);
      await firstRepository.create(
        buildPurchaseOrder({
          items: [
            {
              purchaseOrderItemId: "item-1",
              purchaseOrderId: "po-1",
              productId: "product-1",
              quantityOrdered: 10,
              quantityReceived: 0,
              acquisitionCost: { amount: 10, currencyCode: "BRL" },
              status: "Pending",
            },
          ],
        }),
      );
      firstConnection.close();

      const secondConnection = createDatabase({ environment: "testing", databasePath });
      const secondRepository = new SqlitePurchaseOrderRepository(secondConnection.db);
      const found = await secondRepository.findById("po-1");

      expect(found?.supplierId).toBe("supplier-1");
      expect(found?.items).toHaveLength(1);
      secondConnection.close();
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe("SqliteReceivingRepository", () => {
  it("cria e localiza por Purchase Order, preservando as linhas recebidas", async () => {
    const handle = createTestDatabase();
    const purchaseOrderRepository = new SqlitePurchaseOrderRepository(handle.db);
    await purchaseOrderRepository.create(
      buildPurchaseOrder({
        items: [
          {
            purchaseOrderItemId: "item-1",
            purchaseOrderId: "po-1",
            productId: "product-1",
            quantityOrdered: 10,
            quantityReceived: 0,
            acquisitionCost: { amount: 10, currencyCode: "BRL" },
            status: "Pending",
          },
        ],
      }),
    );

    const repository = new SqliteReceivingRepository(handle.db);
    await repository.create({
      receivingId: "receiving-1",
      purchaseOrderId: "po-1",
      tenantId: "tenant-1",
      lines: [{ purchaseOrderItemId: "item-1", quantityReceived: 4 }],
      receivedAt: new Date("2026-02-01"),
    });

    const found = await repository.findByPurchaseOrder("po-1");
    expect(found).toHaveLength(1);
    expect(found[0]?.lines).toEqual([{ purchaseOrderItemId: "item-1", quantityReceived: 4 }]);
    handle.close();
  });

  it("rejeita uma receiving_lines referenciando um receiving_id inexistente — FOREIGN KEY ativa", () => {
    const handle = createTestDatabase();

    expect(() =>
      handle.db
        .prepare("INSERT INTO receiving_lines (receiving_id, purchase_order_item_id, quantity_received) VALUES (?, ?, ?)")
        .run("receiving-inexistente", "item-1", 1),
    ).toThrow();
    handle.close();
  });

  it("create reverte o Receiving já inserido quando uma linha referencia um purchase_order_item_id inexistente", async () => {
    const handle = createTestDatabase();
    const purchaseOrderRepository = new SqlitePurchaseOrderRepository(handle.db);
    await purchaseOrderRepository.create(buildPurchaseOrder());

    const repository = new SqliteReceivingRepository(handle.db);
    await expect(
      repository.create({
        receivingId: "receiving-rollback",
        purchaseOrderId: "po-1",
        tenantId: "tenant-1",
        lines: [{ purchaseOrderItemId: "item-inexistente", quantityReceived: 1 }],
        receivedAt: new Date("2026-02-01"),
      }),
    ).rejects.toThrow();

    const rawRow = handle.db.prepare("SELECT * FROM receivings WHERE receiving_id = ?").get("receiving-rollback");
    expect(rawRow).toBeUndefined();
    handle.close();
  });
});

describe("SqlitePurchaseRequisitionRepository", () => {
  it("cria, aprova (update nunca regrava lines) e localiza por status", async () => {
    const handle = createTestDatabase();
    const repository = new SqlitePurchaseRequisitionRepository(handle.db);
    const requisition = await repository.create(buildRequisition());

    await repository.update({ ...requisition, status: "Approved" });

    const found = await repository.findById("req-1");
    expect(found?.status).toBe("Approved");
    expect(found?.lines).toEqual([{ productId: "product-1", suggestedQuantity: 30 }]);
    expect(await repository.findByStatus("tenant-1", "Approved")).toHaveLength(1);
    expect(await repository.findByStatus("tenant-1", "Open")).toHaveLength(0);
    handle.close();
  });

  it("rejeita uma purchase_requisition_lines referenciando um requisition_id inexistente — FOREIGN KEY ativa", () => {
    const handle = createTestDatabase();

    expect(() =>
      handle.db
        .prepare("INSERT INTO purchase_requisition_lines (requisition_id, product_id, suggested_quantity) VALUES (?, ?, ?)")
        .run("req-inexistente", "product-1", 10),
    ).toThrow();
    handle.close();
  });

  it("create é atômico — uma segunda tentativa com requisitionId duplicado não deixa nenhuma linha extra gravada", async () => {
    const handle = createTestDatabase();
    const repository = new SqlitePurchaseRequisitionRepository(handle.db);
    await repository.create(buildRequisition());

    await expect(
      repository.create(buildRequisition({ lines: [{ productId: "product-2", suggestedQuantity: 99 }] })),
    ).rejects.toThrow();

    const found = await repository.findById("req-1");
    expect(found?.lines).toEqual([{ productId: "product-1", suggestedQuantity: 30 }]);
    handle.close();
  });

  it("convertToPurchaseOrder — a referência cruzada requisition↔purchaseOrder sobrevive em ambas as tabelas", async () => {
    const handle = createTestDatabase();
    const requisitionRepository = new SqlitePurchaseRequisitionRepository(handle.db);
    const purchaseOrderRepository = new SqlitePurchaseOrderRepository(handle.db);

    const requisition = await requisitionRepository.create(buildRequisition());
    await requisitionRepository.update({ ...requisition, status: "Approved" });

    const purchaseOrder = await purchaseOrderRepository.create(
      buildPurchaseOrder({ purchaseOrderId: "po-from-req", requisitionId: requisition.requisitionId }),
    );
    await requisitionRepository.update({
      ...requisition,
      status: "ConvertedToPurchaseOrder",
      purchaseOrderId: purchaseOrder.purchaseOrderId,
    });

    const foundRequisition = await requisitionRepository.findById(requisition.requisitionId);
    const foundPurchaseOrder = await purchaseOrderRepository.findById("po-from-req");
    expect(foundRequisition?.purchaseOrderId).toBe("po-from-req");
    expect(foundPurchaseOrder?.requisitionId).toBe(requisition.requisitionId);
    handle.close();
  });
});

describe("SqliteReorderRuleRepository", () => {
  it("cria, desativa (active como INTEGER 0/1) e localiza por Produto e por Tenant", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteReorderRuleRepository(handle.db);
    const rule = await repository.create(buildRule());

    expect(await repository.findActiveByProduct("tenant-1", "product-1")).toHaveLength(1);
    expect(await repository.findAllActive("tenant-1")).toHaveLength(1);

    await repository.update({ ...rule, active: false });

    expect(await repository.findActiveByProduct("tenant-1", "product-1")).toHaveLength(0);
    expect(await repository.findAllActive("tenant-1")).toHaveLength(0);
    const found = await repository.findById("rule-1");
    expect(found?.active).toBe(false);
    handle.close();
  });

  it("preferredSupplierId ausente é preservado como undefined, nunca como string vazia", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteReorderRuleRepository(handle.db);
    await repository.create(buildRule());

    const found = await repository.findById("rule-1");
    expect(found?.preferredSupplierId).toBeUndefined();
    handle.close();
  });
});
