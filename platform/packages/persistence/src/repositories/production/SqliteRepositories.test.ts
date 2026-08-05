import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { BillOfMaterials, BOMLine, ProductionConsumption, ProductionOrder, ProductionOutput, WorkCenter } from "@abp/production-hub";
import { describe, expect, it } from "vitest";
import { createDatabase } from "../../db/client.js";
import { runMigrations } from "../../db/migrate.js";
import { createTestDatabase } from "../../testing/createTestDatabase.js";
import { SqliteBillOfMaterialsRepository } from "./SqliteBillOfMaterialsRepository.js";
import { SqliteProductionOrderRepository } from "./SqliteProductionOrderRepository.js";
import { SqliteWorkCenterRepository } from "./SqliteWorkCenterRepository.js";

function buildBillOfMaterials(overrides: Partial<BillOfMaterials> = {}): BillOfMaterials {
  return {
    billOfMaterialsId: "bom-1",
    tenantId: "tenant-1",
    outputProductId: "bread",
    version: 1,
    lines: [{ inputProductId: "flour", quantityPerOutputUnit: 2, unitOfMeasure: "Kilogram" }],
    status: "Active",
    createdAt: new Date("2026-08-04T00:00:00Z"),
    ...overrides,
  };
}

function buildWorkCenter(overrides: Partial<WorkCenter> = {}): WorkCenter {
  return {
    workCenterId: "wc-1",
    tenantId: "tenant-1",
    name: "Linha 1",
    active: true,
    createdAt: new Date("2026-08-04T00:00:00Z"),
    ...overrides,
  };
}

function buildProductionOrder(overrides: Partial<ProductionOrder> = {}): ProductionOrder {
  return {
    productionOrderId: "po-1",
    tenantId: "tenant-1",
    billOfMaterialsId: "bom-1",
    plannedOutputQuantity: 10,
    status: "Planned",
    consumptions: [],
    outputs: [],
    createdAt: new Date("2026-08-04T00:00:00Z"),
    updatedAt: new Date("2026-08-04T00:00:00Z"),
    ...overrides,
  };
}

describe("SqliteBillOfMaterialsRepository", () => {
  describe("CRUD", () => {
    it("save insere e findById retorna a BillOfMaterials com suas BOMLine", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteBillOfMaterialsRepository(handle.db);

      await repository.save(buildBillOfMaterials());
      const found = await repository.findById("bom-1");

      expect(found?.outputProductId).toBe("bread");
      expect(found?.lines).toEqual([{ inputProductId: "flour", quantityPerOutputUnit: 2, unitOfMeasure: "Kilogram", variantId: undefined }]);
      handle.close();
    });

    it("save sobre um id existente atualiza (upsert), nunca duplica linha", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteBillOfMaterialsRepository(handle.db);

      await repository.save(buildBillOfMaterials());
      await repository.save(buildBillOfMaterials({ status: "Superseded", supersededAt: new Date("2026-08-05T00:00:00Z") }));

      const count = handle.db.prepare("SELECT COUNT(*) as count FROM bills_of_materials").get() as { count: number };
      expect(count.count).toBe(1);

      const found = await repository.findById("bom-1");
      expect(found?.status).toBe("Superseded");
      expect(found?.supersededAt).toEqual(new Date("2026-08-05T00:00:00Z"));
      handle.close();
    });

    it("save regrava por completo bom_lines a cada chamada — nunca acumula linhas antigas", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteBillOfMaterialsRepository(handle.db);

      await repository.save(buildBillOfMaterials({ lines: [{ inputProductId: "flour", quantityPerOutputUnit: 2, unitOfMeasure: "Kilogram" }] }));
      await repository.save(
        buildBillOfMaterials({
          lines: [
            { inputProductId: "flour", quantityPerOutputUnit: 2, unitOfMeasure: "Kilogram" },
            { inputProductId: "yeast", quantityPerOutputUnit: 0.05, unitOfMeasure: "Kilogram" },
          ],
        }),
      );

      const found = await repository.findById("bom-1");
      expect(found?.lines).toHaveLength(2);
      handle.close();
    });

    it("findActiveByProduct retorna apenas a versão Active para o Produto", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteBillOfMaterialsRepository(handle.db);

      await repository.save(buildBillOfMaterials({ billOfMaterialsId: "bom-1", status: "Superseded", supersededAt: new Date() }));
      await repository.save(buildBillOfMaterials({ billOfMaterialsId: "bom-2", version: 2, status: "Active" }));

      const found = await repository.findActiveByProduct("bread");
      expect(found?.billOfMaterialsId).toBe("bom-2");
      handle.close();
    });

    it("findById retorna undefined para identificador inexistente", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteBillOfMaterialsRepository(handle.db);

      expect(await repository.findById("does-not-exist")).toBeUndefined();
      handle.close();
    });

    it("preserva quantityPerOutputUnit fracionário (REAL) e variantId opcional", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteBillOfMaterialsRepository(handle.db);

      await repository.save(
        buildBillOfMaterials({
          lines: [{ inputProductId: "flour", variantId: "variant-1", quantityPerOutputUnit: 0.375, unitOfMeasure: "Kilogram" }],
        }),
      );

      const found = await repository.findById("bom-1");
      expect(found?.lines[0]?.quantityPerOutputUnit).toBe(0.375);
      expect(found?.lines[0]?.variantId).toBe("variant-1");
      handle.close();
    });

    it("supersededAt ausente é preservado como undefined, nunca como epoch zero", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteBillOfMaterialsRepository(handle.db);

      await repository.save(buildBillOfMaterials());
      const found = await repository.findById("bom-1");

      expect(found?.supersededAt).toBeUndefined();
      handle.close();
    });
  });

  describe("Constraints (Foreign Keys)", () => {
    it("bom_lines rejeita inserção direta referenciando uma BillOfMaterials inexistente", () => {
      const handle = createTestDatabase();

      expect(() =>
        handle.db
          .prepare("INSERT INTO bom_lines (bill_of_materials_id, input_product_id, quantity_per_output_unit, unit_of_measure) VALUES (?, ?, ?, ?)")
          .run("does-not-exist", "flour", 1, "Kilogram"),
      ).toThrow();
      handle.close();
    });
  });

  describe("Rollback (atomicidade)", () => {
    it("save reverte a BillOfMaterials já inserida quando a inserção de uma line falha na mesma transação", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteBillOfMaterialsRepository(handle.db);

      const malformedLines = [
        { inputProductId: "flour", quantityPerOutputUnit: 2, unitOfMeasure: "Kilogram" },
        { inputProductId: undefined as unknown as string, quantityPerOutputUnit: 1, unitOfMeasure: "Kilogram" },
      ] satisfies BOMLine[];

      await expect(repository.save(buildBillOfMaterials({ lines: malformedLines }))).rejects.toThrow();

      const rawRow = handle.db.prepare("SELECT * FROM bills_of_materials WHERE bill_of_materials_id = ?").get("bom-1");
      expect(rawRow).toBeUndefined();
      const rawLines = handle.db.prepare("SELECT * FROM bom_lines WHERE bill_of_materials_id = ?").all("bom-1");
      expect(rawLines).toHaveLength(0);
      handle.close();
    });
  });

  describe("Persistência entre conexões", () => {
    it("BillOfMaterials + BOMLine sobrevivem ao fechar e reabrir uma nova conexão contra o mesmo arquivo", async () => {
      const tempDir = mkdtempSync(path.join(os.tmpdir(), "abp-production-persistence-test-"));
      const databasePath = path.join(tempDir, "test.sqlite3");

      try {
        const firstConnection = createDatabase({ environment: "testing", databasePath });
        runMigrations(firstConnection);
        await new SqliteBillOfMaterialsRepository(firstConnection.db).save(buildBillOfMaterials());
        firstConnection.close();

        const secondConnection = createDatabase({ environment: "testing", databasePath });
        const found = await new SqliteBillOfMaterialsRepository(secondConnection.db).findById("bom-1");

        expect(found?.outputProductId).toBe("bread");
        expect(found?.lines).toHaveLength(1);
        secondConnection.close();
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });
});

describe("SqliteWorkCenterRepository", () => {
  describe("CRUD", () => {
    it("save insere e findActive retorna apenas Work Centers ativos", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteWorkCenterRepository(handle.db);

      await repository.save(buildWorkCenter({ workCenterId: "wc-1", active: true }));
      await repository.save(buildWorkCenter({ workCenterId: "wc-2", active: false }));

      const active = await repository.findActive();
      expect(active.map((w) => w.workCenterId)).toEqual(["wc-1"]);
      handle.close();
    });

    it("save sobre um id existente atualiza (upsert), nunca duplica", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteWorkCenterRepository(handle.db);

      await repository.save(buildWorkCenter({ active: true }));
      await repository.save(buildWorkCenter({ active: false }));

      const count = handle.db.prepare("SELECT COUNT(*) as count FROM work_centers").get() as { count: number };
      expect(count.count).toBe(1);

      const active = await repository.findActive();
      expect(active).toHaveLength(0);
      handle.close();
    });

    it("preserva nominalCapacity opcional e o round-trip de active (boolean <-> INTEGER)", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteWorkCenterRepository(handle.db);

      await repository.save(buildWorkCenter({ workCenterId: "wc-1", nominalCapacity: 120.5, active: true }));
      await repository.save(buildWorkCenter({ workCenterId: "wc-2", active: false }));

      const active = await repository.findActive();
      expect(active[0]?.nominalCapacity).toBe(120.5);

      const raw = handle.db.prepare("SELECT active FROM work_centers WHERE work_center_id = ?").get("wc-2") as { active: number };
      expect(raw.active).toBe(0);
      handle.close();
    });
  });
});

describe("SqliteProductionOrderRepository", () => {
  async function seedBillOfMaterialsAndWorkCenter(db: ReturnType<typeof createTestDatabase>["db"]) {
    await new SqliteBillOfMaterialsRepository(db).save(buildBillOfMaterials());
    await new SqliteWorkCenterRepository(db).save(buildWorkCenter());
  }

  describe("CRUD", () => {
    it("save insere e findById retorna a ProductionOrder", async () => {
      const handle = createTestDatabase();
      await seedBillOfMaterialsAndWorkCenter(handle.db);
      const repository = new SqliteProductionOrderRepository(handle.db);

      await repository.save(buildProductionOrder({ workCenterId: "wc-1", orderId: "order-1" }));
      const found = await repository.findById("po-1");

      expect(found?.status).toBe("Planned");
      expect(found?.workCenterId).toBe("wc-1");
      expect(found?.orderId).toBe("order-1");
      expect(found?.consumptions).toEqual([]);
      expect(found?.outputs).toEqual([]);
      handle.close();
    });

    it("save sobre um id existente atualiza (upsert), preservando transições de status e datas opcionais", async () => {
      const handle = createTestDatabase();
      await seedBillOfMaterialsAndWorkCenter(handle.db);
      const repository = new SqliteProductionOrderRepository(handle.db);

      await repository.save(buildProductionOrder());
      await repository.save(buildProductionOrder({ status: "InProgress", startedAt: new Date("2026-08-04T10:00:00Z") }));

      const count = handle.db.prepare("SELECT COUNT(*) as count FROM production_orders").get() as { count: number };
      expect(count.count).toBe(1);

      const found = await repository.findById("po-1");
      expect(found?.status).toBe("InProgress");
      expect(found?.startedAt).toEqual(new Date("2026-08-04T10:00:00Z"));
      expect(found?.completedAt).toBeUndefined();
      handle.close();
    });

    it("save persiste consumptions e outputs, e findById devolve ambos os arrays hidratados", async () => {
      const handle = createTestDatabase();
      await seedBillOfMaterialsAndWorkCenter(handle.db);
      const repository = new SqliteProductionOrderRepository(handle.db);

      const consumption: ProductionConsumption = {
        consumptionId: "consumption-1",
        productionOrderId: "po-1",
        inputProductId: "flour",
        quantityConsumed: 20,
        acquisitionCost: 12.34,
        consumedAt: new Date("2026-08-04T11:00:00Z"),
      };
      const output: ProductionOutput = {
        outputId: "output-1",
        productionOrderId: "po-1",
        outputProductId: "bread",
        quantityGenerated: 9,
        generatedAt: new Date("2026-08-04T12:00:00Z"),
      };

      await repository.save(buildProductionOrder({ status: "InProgress", consumptions: [consumption], outputs: [output] }));
      const found = await repository.findById("po-1");

      expect(found?.consumptions).toEqual([consumption]);
      expect(found?.outputs).toEqual([output]);
      handle.close();
    });

    it("save regrava por completo consumptions/outputs a cada chamada — nunca acumula registros antigos", async () => {
      const handle = createTestDatabase();
      await seedBillOfMaterialsAndWorkCenter(handle.db);
      const repository = new SqliteProductionOrderRepository(handle.db);

      const firstConsumption: ProductionConsumption = {
        consumptionId: "consumption-1",
        productionOrderId: "po-1",
        inputProductId: "flour",
        quantityConsumed: 10,
        acquisitionCost: 5,
        consumedAt: new Date("2026-08-04T11:00:00Z"),
      };
      const secondConsumption: ProductionConsumption = {
        consumptionId: "consumption-2",
        productionOrderId: "po-1",
        inputProductId: "flour",
        quantityConsumed: 10,
        acquisitionCost: 5,
        consumedAt: new Date("2026-08-04T11:30:00Z"),
      };

      await repository.save(buildProductionOrder({ status: "InProgress", consumptions: [firstConsumption] }));
      await repository.save(buildProductionOrder({ status: "InProgress", consumptions: [firstConsumption, secondConsumption] }));

      const rows = handle.db.prepare("SELECT COUNT(*) as count FROM production_consumptions WHERE production_order_id = ?").get("po-1") as {
        count: number;
      };
      expect(rows.count).toBe(2);
      handle.close();
    });

    it("findByStatus filtra corretamente", async () => {
      const handle = createTestDatabase();
      await seedBillOfMaterialsAndWorkCenter(handle.db);
      const repository = new SqliteProductionOrderRepository(handle.db);

      await repository.save(buildProductionOrder({ productionOrderId: "po-1", status: "Planned" }));
      await repository.save(buildProductionOrder({ productionOrderId: "po-2", status: "InProgress" }));

      const planned = await repository.findByStatus("Planned");
      expect(planned.map((o) => o.productionOrderId)).toEqual(["po-1"]);
      handle.close();
    });

    it("findByOrigin filtra por orderId, retornando lista vazia quando ausente", async () => {
      const handle = createTestDatabase();
      await seedBillOfMaterialsAndWorkCenter(handle.db);
      const repository = new SqliteProductionOrderRepository(handle.db);

      await repository.save(buildProductionOrder({ productionOrderId: "po-1", orderId: "order-99" }));
      await repository.save(buildProductionOrder({ productionOrderId: "po-2" }));

      expect((await repository.findByOrigin("order-99")).map((o) => o.productionOrderId)).toEqual(["po-1"]);
      expect(await repository.findByOrigin("order-does-not-exist")).toEqual([]);
      handle.close();
    });

    it("cancelReason ausente é preservado como undefined", async () => {
      const handle = createTestDatabase();
      await seedBillOfMaterialsAndWorkCenter(handle.db);
      const repository = new SqliteProductionOrderRepository(handle.db);

      await repository.save(buildProductionOrder());
      expect((await repository.findById("po-1"))?.cancelReason).toBeUndefined();

      await repository.save(buildProductionOrder({ status: "Cancelled", cancelReason: "Cliente desistiu" }));
      expect((await repository.findById("po-1"))?.cancelReason).toBe("Cliente desistiu");
      handle.close();
    });
  });

  describe("Constraints (Foreign Keys)", () => {
    it("save rejeita referenciar uma BillOfMaterials inexistente", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteProductionOrderRepository(handle.db);

      await expect(repository.save(buildProductionOrder({ billOfMaterialsId: "does-not-exist" }))).rejects.toThrow();
      handle.close();
    });

    it("save rejeita referenciar um WorkCenter inexistente", async () => {
      const handle = createTestDatabase();
      await new SqliteBillOfMaterialsRepository(handle.db).save(buildBillOfMaterials());
      const repository = new SqliteProductionOrderRepository(handle.db);

      await expect(repository.save(buildProductionOrder({ workCenterId: "does-not-exist" }))).rejects.toThrow();
      handle.close();
    });

    it("production_consumptions rejeita inserção direta referenciando uma ProductionOrder inexistente", () => {
      const handle = createTestDatabase();

      expect(() =>
        handle.db
          .prepare(
            "INSERT INTO production_consumptions (consumption_id, production_order_id, input_product_id, quantity_consumed, acquisition_cost, consumed_at) VALUES (?, ?, ?, ?, ?, ?)",
          )
          .run("consumption-1", "does-not-exist", "flour", 1, 1, Date.now()),
      ).toThrow();
      handle.close();
    });

    it("production_outputs rejeita inserção direta referenciando uma ProductionOrder inexistente", () => {
      const handle = createTestDatabase();

      expect(() =>
        handle.db
          .prepare(
            "INSERT INTO production_outputs (output_id, production_order_id, output_product_id, quantity_generated, generated_at) VALUES (?, ?, ?, ?, ?)",
          )
          .run("output-1", "does-not-exist", "bread", 1, Date.now()),
      ).toThrow();
      handle.close();
    });
  });

  describe("Rollback (atomicidade)", () => {
    it("save reverte a ProductionOrder já inserida quando a inserção de um consumption duplicado falha na mesma transação", async () => {
      const handle = createTestDatabase();
      await seedBillOfMaterialsAndWorkCenter(handle.db);
      const repository = new SqliteProductionOrderRepository(handle.db);

      const duplicated: ProductionConsumption = {
        consumptionId: "consumption-dup",
        productionOrderId: "po-rollback",
        inputProductId: "flour",
        quantityConsumed: 10,
        acquisitionCost: 5,
        consumedAt: new Date(),
      };

      await expect(
        repository.save(
          buildProductionOrder({
            productionOrderId: "po-rollback",
            status: "InProgress",
            consumptions: [duplicated, { ...duplicated, inputProductId: "yeast" }],
          }),
        ),
      ).rejects.toThrow();

      const rawRow = handle.db.prepare("SELECT * FROM production_orders WHERE production_order_id = ?").get("po-rollback");
      expect(rawRow).toBeUndefined();
      handle.close();
    });
  });

  describe("Persistência entre conexões", () => {
    it("ProductionOrder + consumptions/outputs sobrevivem ao fechar e reabrir uma nova conexão contra o mesmo arquivo", async () => {
      const tempDir = mkdtempSync(path.join(os.tmpdir(), "abp-production-order-persistence-test-"));
      const databasePath = path.join(tempDir, "test.sqlite3");

      try {
        const firstConnection = createDatabase({ environment: "testing", databasePath });
        runMigrations(firstConnection);
        await new SqliteBillOfMaterialsRepository(firstConnection.db).save(buildBillOfMaterials());
        await new SqliteProductionOrderRepository(firstConnection.db).save(
          buildProductionOrder({
            status: "InProgress",
            consumptions: [
              {
                consumptionId: "consumption-1",
                productionOrderId: "po-1",
                inputProductId: "flour",
                quantityConsumed: 20,
                acquisitionCost: 40,
                consumedAt: new Date("2026-08-04T11:00:00Z"),
              },
            ],
          }),
        );
        firstConnection.close();

        const secondConnection = createDatabase({ environment: "testing", databasePath });
        const found = await new SqliteProductionOrderRepository(secondConnection.db).findById("po-1");

        expect(found?.status).toBe("InProgress");
        expect(found?.consumptions).toHaveLength(1);
        expect(found?.consumptions[0]?.acquisitionCost).toBe(40);
        secondConnection.close();
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });
});
