import type { Supplier } from "@abp/supplier-hub";
import { describe, expect, it } from "vitest";
import { createDatabase } from "../../db/client.js";
import { runMigrations } from "../../db/migrate.js";
import { createTestDatabase } from "../../testing/createTestDatabase.js";
import { SqliteSupplierCatalogItemRepository } from "./SqliteSupplierCatalogItemRepository.js";
import { SqliteSupplierContractRepository } from "./SqliteSupplierContractRepository.js";
import { SqliteSupplierPerformanceRepository } from "./SqliteSupplierPerformanceRepository.js";
import { SqliteSupplierRepository } from "./SqliteSupplierRepository.js";

function buildSupplier(overrides: Partial<Supplier> = {}): Supplier {
  const now = new Date("2026-01-01T12:00:00.000Z");
  return {
    supplierId: "supplier-1",
    tenantId: "tenant-1",
    legalName: "Floricultura Atacado Ltda.",
    taxId: { value: "12345678000199" },
    status: "Active",
    supplyCategory: "Flores",
    contacts: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("SqliteSupplierRepository — CRUD completo", () => {
  it("cria, recupera por id, e persiste contacts embutidos (parte interna do Aggregate)", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteSupplierRepository(handle.db);

    const supplier = buildSupplier({
      contacts: [{ contactId: "contact-1", supplierId: "supplier-1", name: "Maria Souza", role: "Commercial" }],
    });
    await repository.create(supplier);

    const found = await repository.findById("supplier-1");
    expect(found?.legalName).toBe("Floricultura Atacado Ltda.");
    expect(found?.contacts).toHaveLength(1);
    expect(found?.contacts[0]?.name).toBe("Maria Souza");
    handle.close();
  });

  it("findByTaxId encontra o Supplier pelo par (tenant, taxId)", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteSupplierRepository(handle.db);
    await repository.create(buildSupplier());

    const found = await repository.findByTaxId("tenant-1", "12345678000199");
    expect(found?.supplierId).toBe("supplier-1");
    expect(await repository.findByTaxId("tenant-2", "12345678000199")).toBeUndefined();
    handle.close();
  });

  it("update altera status e regrava a lista de contacts por completo, sem duplicar os antigos", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteSupplierRepository(handle.db);
    const supplier = await repository.create(
      buildSupplier({ contacts: [{ contactId: "contact-1", supplierId: "supplier-1", name: "Primeiro", role: "Commercial" }] }),
    );

    await repository.update({
      ...supplier,
      status: "Disabled",
      contacts: [{ contactId: "contact-2", supplierId: "supplier-1", name: "Segundo", role: "Financial" }],
    });

    const found = await repository.findById("supplier-1");
    expect(found?.status).toBe("Disabled");
    expect(found?.contacts).toHaveLength(1);
    expect(found?.contacts[0]?.name).toBe("Segundo");
    handle.close();
  });

  it("findActive retorna apenas Supplier com status Active, isolado por tenant", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteSupplierRepository(handle.db);

    await repository.create(buildSupplier({ supplierId: "s1", taxId: { value: "11111111000191" } }));
    await repository.create(buildSupplier({ supplierId: "s2", taxId: { value: "22222222000192" }, status: "Disabled" }));
    await repository.create(buildSupplier({ supplierId: "s3", taxId: { value: "33333333000193" }, tenantId: "tenant-2" }));

    const active = await repository.findActive("tenant-1");
    expect(active.map((s) => s.supplierId)).toEqual(["s1"]);
    handle.close();
  });
});

describe("SqliteSupplierRepository — Constraints e Duplicidade", () => {
  it("rejeita dois Supplier com o mesmo (tenant_id, tax_id_value) — UNIQUE constraint em profundidade", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteSupplierRepository(handle.db);
    await repository.create(buildSupplier());

    await expect(repository.create(buildSupplier({ supplierId: "supplier-2" }))).rejects.toThrow();
    handle.close();
  });

  it("aceita o mesmo tax_id_value em Tenants diferentes — a constraint é composta, nunca isolada", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteSupplierRepository(handle.db);
    await repository.create(buildSupplier());

    await expect(repository.create(buildSupplier({ supplierId: "supplier-2", tenantId: "tenant-2" }))).resolves.toBeDefined();
    handle.close();
  });

  it("rejeita um supplier_contacts referenciando um supplier_id inexistente — FOREIGN KEY ativa", () => {
    const handle = createTestDatabase();

    expect(() =>
      handle.db
        .prepare("INSERT INTO supplier_contacts (contact_id, supplier_id, name, role) VALUES (?, ?, ?, ?)")
        .run("contact-orfao", "supplier-inexistente", "Órfão", "Commercial"),
    ).toThrow();
    handle.close();
  });
});

describe("SqliteSupplierRepository — Rollback (atomicidade)", () => {
  it("create reverte o Supplier já inserido quando a inserção de um contact falha na mesma transação", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteSupplierRepository(handle.db);

    const malformed = buildSupplier({
      supplierId: "supplier-rollback",
      contacts: [
        { contactId: "contact-dup", supplierId: "supplier-rollback", name: "A", role: "Commercial" },
        { contactId: "contact-dup", supplierId: "supplier-rollback", name: "B", role: "Financial" },
      ],
    });

    await expect(repository.create(malformed)).rejects.toThrow();

    const rawRow = handle.db.prepare("SELECT * FROM suppliers WHERE supplier_id = ?").get("supplier-rollback");
    expect(rawRow).toBeUndefined();
    handle.close();
  });

  it("update reverte por completo quando falha — nenhuma alteração parcial permanece gravada", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteSupplierRepository(handle.db);
    const supplier = await repository.create(buildSupplier());

    await expect(
      repository.update({
        ...supplier,
        legalName: "Nome Que Nunca Deveria Persistir",
        contacts: [
          { contactId: "contact-dup", supplierId: supplier.supplierId, name: "A", role: "Commercial" },
          { contactId: "contact-dup", supplierId: supplier.supplierId, name: "B", role: "Financial" },
        ],
      }),
    ).rejects.toThrow();

    const found = await repository.findById(supplier.supplierId);
    expect(found?.legalName).toBe("Floricultura Atacado Ltda.");
    handle.close();
  });
});

describe("SqliteSupplierRepository — Persistência entre conexões", () => {
  it("dado criado por uma conexão sobrevive ao fechar e reabrir uma nova conexão contra o mesmo arquivo", async () => {
    const { mkdtempSync, rmSync } = await import("node:fs");
    const os = await import("node:os");
    const path = await import("node:path");

    const tempDir = mkdtempSync(path.join(os.tmpdir(), "abp-supplier-persistence-test-"));
    const databasePath = path.join(tempDir, "test.sqlite3");

    try {
      const firstConnection = createDatabase({ environment: "testing", databasePath });
      runMigrations(firstConnection);
      const firstRepository = new SqliteSupplierRepository(firstConnection.db);
      await firstRepository.create(
        buildSupplier({ contacts: [{ contactId: "contact-1", supplierId: "supplier-1", name: "Maria", role: "Commercial" }] }),
      );
      firstConnection.close();

      const secondConnection = createDatabase({ environment: "testing", databasePath });
      const secondRepository = new SqliteSupplierRepository(secondConnection.db);
      const found = await secondRepository.findById("supplier-1");

      expect(found?.legalName).toBe("Floricultura Atacado Ltda.");
      expect(found?.contacts).toHaveLength(1);
      secondConnection.close();
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe("SqliteSupplierRepository — Performance básica", () => {
  it("cria e lista 200 Suppliers em tempo aceitável, sem degradação estrutural", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteSupplierRepository(handle.db);

    const start = performance.now();
    for (let index = 0; index < 200; index += 1) {
      await repository.create(
        buildSupplier({
          supplierId: `supplier-${index}`,
          taxId: { value: String(10000000000 + index).padStart(14, "0") },
        }),
      );
    }
    const elapsedMs = performance.now() - start;

    const active = await repository.findActive("tenant-1");
    expect(active).toHaveLength(200);
    expect(elapsedMs).toBeLessThan(5000);
    handle.close();
  });
});

describe("SqliteSupplierCatalogItemRepository", () => {
  it("cria, atualiza e localiza por Supplier e por Produto", async () => {
    const handle = createTestDatabase();
    const supplierRepository = new SqliteSupplierRepository(handle.db);
    await supplierRepository.create(buildSupplier());

    const repository = new SqliteSupplierCatalogItemRepository(handle.db);
    const item = await repository.create({
      catalogItemId: "item-1",
      supplierId: "supplier-1",
      tenantId: "tenant-1",
      productId: "product-1",
      listPrice: { amount: 19.9, currencyCode: "BRL" },
      leadTimeInDays: 5,
      minimumOrderQuantity: 10,
      createdAt: new Date(),
    });

    const updated = await repository.update({ ...item, listPrice: { amount: 21.5, currencyCode: "BRL" } });
    expect(updated.listPrice.amount).toBe(21.5);
    expect((await repository.findById("item-1"))?.listPrice.amount).toBe(21.5);
    expect(await repository.findBySupplier("supplier-1")).toHaveLength(1);
    expect(await repository.findByProduct("product-1")).toHaveLength(1);
    handle.close();
  });
});

describe("SqliteSupplierContractRepository", () => {
  it("cria e localiza por Supplier, preservando endsAt ausente (prazo indeterminado)", async () => {
    const handle = createTestDatabase();
    const supplierRepository = new SqliteSupplierRepository(handle.db);
    await supplierRepository.create(buildSupplier());

    const repository = new SqliteSupplierContractRepository(handle.db);
    await repository.create({
      contractId: "contract-1",
      supplierId: "supplier-1",
      tenantId: "tenant-1",
      startsAt: new Date("2026-01-01"),
      paymentTerms: { dueInDays: 30 },
      createdAt: new Date(),
    });

    const found = await repository.findById("contract-1");
    expect(found?.endsAt).toBeUndefined();
    expect(found?.paymentTerms.dueInDays).toBe(30);
    expect(await repository.findBySupplier("supplier-1")).toHaveLength(1);
    handle.close();
  });
});

describe("SqliteSupplierPerformanceRepository", () => {
  it("acumula registros imutáveis via append, recuperáveis por Supplier", async () => {
    const handle = createTestDatabase();
    const supplierRepository = new SqliteSupplierRepository(handle.db);
    await supplierRepository.create(buildSupplier());

    const repository = new SqliteSupplierPerformanceRepository(handle.db);
    await repository.append({
      recordId: "record-1",
      supplierId: "supplier-1",
      tenantId: "tenant-1",
      purchaseOrderId: "po-1",
      observationType: "OnTimeDelivery",
      observedAt: new Date(),
    });
    await repository.append({
      recordId: "record-2",
      supplierId: "supplier-1",
      tenantId: "tenant-1",
      purchaseOrderId: "po-1",
      observationType: "QuantityMatch",
      observedAt: new Date(),
    });

    const history = await repository.findBySupplier("supplier-1");
    expect(history.map((r) => r.observationType)).toEqual(["OnTimeDelivery", "QuantityMatch"]);
    expect((repository as unknown as Record<string, unknown>).update).toBeUndefined();
    handle.close();
  });
});
