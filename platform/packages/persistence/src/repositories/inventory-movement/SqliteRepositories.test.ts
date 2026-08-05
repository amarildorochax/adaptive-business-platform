import type { StockAlertRule, StockLocation, StockMovement, StockReservation } from "@abp/inventory-movement-hub";
import { describe, expect, it } from "vitest";
import { createDatabase } from "../../db/client.js";
import { runMigrations } from "../../db/migrate.js";
import { createTestDatabase } from "../../testing/createTestDatabase.js";
import { SqliteStockAlertRuleRepository } from "./SqliteStockAlertRuleRepository.js";
import { SqliteStockLocationRepository } from "./SqliteStockLocationRepository.js";
import { SqliteStockMovementRepository } from "./SqliteStockMovementRepository.js";
import { SqliteStockPositionRepository } from "./SqliteStockPositionRepository.js";
import { SqliteStockReservationRepository } from "./SqliteStockReservationRepository.js";

function buildMovement(overrides: Partial<StockMovement> = {}): StockMovement {
  return {
    movementId: "movement-1",
    tenantId: "tenant-1",
    productId: "product-1",
    quantityDelta: 10,
    origin: "Purchase",
    originReferenceId: "po-1",
    occurredAt: new Date("2026-01-01T12:00:00.000Z"),
    ...overrides,
  };
}

function buildReservation(overrides: Partial<StockReservation> = {}): StockReservation {
  const now = new Date("2026-01-01T12:00:00.000Z");
  return {
    reservationId: "reservation-1",
    tenantId: "tenant-1",
    productId: "product-1",
    quantity: 4,
    orderId: "order-1",
    status: "Active",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function buildLocation(overrides: Partial<StockLocation> = {}): StockLocation {
  return {
    locationId: "location-1",
    tenantId: "tenant-1",
    name: "Depósito Central",
    active: true,
    createdAt: new Date("2026-01-01T12:00:00.000Z"),
    ...overrides,
  };
}

function buildRule(overrides: Partial<StockAlertRule> = {}): StockAlertRule {
  const now = new Date("2026-01-01T12:00:00.000Z");
  return {
    ruleId: "rule-1",
    tenantId: "tenant-1",
    productId: "product-1",
    thresholdQuantity: 5,
    active: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("SqliteStockMovementRepository — CRUD permitido pelo domínio", () => {
  it("append grava e findByProduct recupera, preservando todos os campos", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockMovementRepository(handle.db);

    await repository.append(buildMovement({ variantId: "variant-1", locationId: "location-1" }));

    const found = await repository.findByProduct("product-1", "location-1");
    expect(found).toHaveLength(1);
    expect(found[0]?.quantityDelta).toBe(10);
    expect(found[0]?.origin).toBe("Purchase");
    expect(found[0]?.variantId).toBe("variant-1");
    handle.close();
  });

  it("findByProduct sem locationId retorna movimentações de qualquer localização do mesmo Produto", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockMovementRepository(handle.db);

    await repository.append(buildMovement({ movementId: "m-1", locationId: "location-a" }));
    await repository.append(buildMovement({ movementId: "m-2", locationId: "location-b" }));

    const found = await repository.findByProduct("product-1");
    expect(found).toHaveLength(2);
    handle.close();
  });

  it("findByOriginReference retorna apenas as movimentações do Purchase Order/Production Order de origem", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockMovementRepository(handle.db);

    await repository.append(buildMovement({ movementId: "m-1", originReferenceId: "po-1" }));
    await repository.append(buildMovement({ movementId: "m-2", productId: "product-2", originReferenceId: "po-2" }));

    const found = await repository.findByOriginReference("po-1");
    expect(found).toHaveLength(1);
    expect(found[0]?.movementId).toBe("m-1");
    handle.close();
  });
});

describe("SqliteStockMovementRepository — Constraints", () => {
  it("rejeita quantity_delta ausente — coluna NOT NULL", () => {
    const handle = createTestDatabase();

    expect(() =>
      handle.db
        .prepare(
          "INSERT INTO stock_movements (movement_id, tenant_id, product_id, quantity_delta, origin, occurred_at) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .run("movement-invalido", "tenant-1", "product-1", null, "Purchase", Date.now()),
    ).toThrow();
    handle.close();
  });
});

describe("SqliteStockMovementRepository — Append-Only (cenários obrigatórios do ledger)", () => {
  it("registrar movimento → consultar movimento → tentar alterar → falha", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockMovementRepository(handle.db);
    await repository.append(buildMovement());

    const beforeAttempt = await repository.findByProduct("product-1");
    expect(beforeAttempt[0]?.quantityDelta).toBe(10);

    expect(() =>
      handle.db.prepare("UPDATE stock_movements SET quantity_delta = ? WHERE movement_id = ?").run(999, "movement-1"),
    ).toThrow(/append-only/);

    const afterAttempt = await repository.findByProduct("product-1");
    expect(afterAttempt[0]?.quantityDelta).toBe(10);
    handle.close();
  });

  it("registrar movimento → tentar remover → falha", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockMovementRepository(handle.db);
    await repository.append(buildMovement());

    expect(() => handle.db.prepare("DELETE FROM stock_movements WHERE movement_id = ?").run("movement-1")).toThrow(
      /append-only/,
    );

    const found = await repository.findByProduct("product-1");
    expect(found).toHaveLength(1);
    handle.close();
  });

  it("o trigger de append-only rejeita mesmo uma alteração que não muda o valor — qualquer UPDATE é proibido, não apenas UPDATE de dado divergente", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockMovementRepository(handle.db);
    await repository.append(buildMovement());

    expect(() =>
      handle.db.prepare("UPDATE stock_movements SET quantity_delta = quantity_delta WHERE movement_id = ?").run("movement-1"),
    ).toThrow(/append-only/);
    handle.close();
  });

  it("registrar sequência de movimentos → consultar ordem cronológica → validar integridade", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockMovementRepository(handle.db);

    await repository.append(buildMovement({ movementId: "m-1", quantityDelta: 10, occurredAt: new Date("2026-01-01T10:00:00.000Z") }));
    await repository.append(buildMovement({ movementId: "m-2", quantityDelta: -3, occurredAt: new Date("2026-01-01T11:00:00.000Z"), origin: "SaleReturn" }));
    await repository.append(buildMovement({ movementId: "m-3", quantityDelta: 5, occurredAt: new Date("2026-01-01T12:00:00.000Z") }));

    const found = await repository.findByProduct("product-1");
    expect(found.map((m) => m.movementId)).toEqual(["m-1", "m-2", "m-3"]);
    expect(found.reduce((sum, m) => sum + m.quantityDelta, 0)).toBe(12);
    handle.close();
  });

  it("registrar movimentações simultâneas → validar consistência da soma final", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockMovementRepository(handle.db);

    await Promise.all([
      repository.append(buildMovement({ movementId: "m-1", quantityDelta: 10 })),
      repository.append(buildMovement({ movementId: "m-2", quantityDelta: 5 })),
      repository.append(buildMovement({ movementId: "m-3", quantityDelta: -2 })),
      repository.append(buildMovement({ movementId: "m-4", quantityDelta: 7 })),
    ]);

    const found = await repository.findByProduct("product-1");
    expect(found).toHaveLength(4);
    expect(found.reduce((sum, m) => sum + m.quantityDelta, 0)).toBe(20);
    handle.close();
  });
});

describe("SqliteStockPositionRepository — projeção derivada", () => {
  it("recalculate soma o ledger real (stock_movements) e as reservas ativas (stock_reservations), nunca decide regra de negócio", async () => {
    const handle = createTestDatabase();
    const movementRepository = new SqliteStockMovementRepository(handle.db);
    const reservationRepository = new SqliteStockReservationRepository(handle.db);
    const positionRepository = new SqliteStockPositionRepository(handle.db);

    await movementRepository.append(buildMovement({ movementId: "m-1", quantityDelta: 10 }));
    await movementRepository.append(buildMovement({ movementId: "m-2", quantityDelta: -3, origin: "SaleReturn" }));
    await reservationRepository.create(buildReservation({ quantity: 2 }));

    const position = await positionRepository.recalculate("product-1");

    expect(position.quantityOnHand).toBe(7);
    expect(position.quantityReserved).toBe(2);
    expect(position.quantityAvailable).toBe(5);
    handle.close();
  });

  it("findByProduct retorna undefined antes de qualquer recalculate — nenhum valor é inventado", async () => {
    const handle = createTestDatabase();
    const positionRepository = new SqliteStockPositionRepository(handle.db);

    expect(await positionRepository.findByProduct("product-nunca-recalculado")).toBeUndefined();
    handle.close();
  });

  it("findByProduct reflete o valor já persistido por um recalculate anterior, sem recalcular de novo", async () => {
    const handle = createTestDatabase();
    const movementRepository = new SqliteStockMovementRepository(handle.db);
    const positionRepository = new SqliteStockPositionRepository(handle.db);

    await movementRepository.append(buildMovement({ quantityDelta: 8 }));
    await positionRepository.recalculate("product-1");

    const found = await positionRepository.findByProduct("product-1");
    expect(found?.quantityOnHand).toBe(8);
    handle.close();
  });

  it("recalculate isola a soma por locationId — mesmo produto, dois pontos físicos distintos", async () => {
    const handle = createTestDatabase();
    const movementRepository = new SqliteStockMovementRepository(handle.db);
    const positionRepository = new SqliteStockPositionRepository(handle.db);

    await movementRepository.append(buildMovement({ movementId: "m-a", locationId: "location-a", quantityDelta: 10 }));
    await movementRepository.append(buildMovement({ movementId: "m-b", locationId: "location-b", quantityDelta: 4 }));

    const positionA = await positionRepository.recalculate("product-1", "location-a");
    const positionB = await positionRepository.recalculate("product-1", "location-b");

    expect(positionA.quantityOnHand).toBe(10);
    expect(positionB.quantityOnHand).toBe(4);
    handle.close();
  });

  it("recalculate chamado novamente sobrescreve (upsert), nunca duplica a linha em stock_positions", async () => {
    const handle = createTestDatabase();
    const movementRepository = new SqliteStockMovementRepository(handle.db);
    const positionRepository = new SqliteStockPositionRepository(handle.db);

    await movementRepository.append(buildMovement({ movementId: "m-1", quantityDelta: 5 }));
    await positionRepository.recalculate("product-1");
    await movementRepository.append(buildMovement({ movementId: "m-2", quantityDelta: 3 }));
    await positionRepository.recalculate("product-1");

    const rows = handle.db.prepare("SELECT COUNT(*) as count FROM stock_positions WHERE product_id = ?").get("product-1") as { count: number };
    expect(rows.count).toBe(1);

    const found = await positionRepository.findByProduct("product-1");
    expect(found?.quantityOnHand).toBe(8);
    handle.close();
  });

  it("quantityAvailable nunca é negativo na prática — reflete exatamente onHand - reserved já validado pelo Core antes da chamada", async () => {
    const handle = createTestDatabase();
    const movementRepository = new SqliteStockMovementRepository(handle.db);
    const reservationRepository = new SqliteStockReservationRepository(handle.db);
    const positionRepository = new SqliteStockPositionRepository(handle.db);

    await movementRepository.append(buildMovement({ quantityDelta: 6 }));
    await reservationRepository.create(buildReservation({ quantity: 6 }));

    const position = await positionRepository.recalculate("product-1");
    expect(position.quantityAvailable).toBe(0);
    handle.close();
  });
});

describe("SqliteStockReservationRepository — CRUD e máquina de estados", () => {
  it("create, update (troca de status) e findById refletem o estado real", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockReservationRepository(handle.db);
    const reservation = await repository.create(buildReservation());

    await repository.update({ ...reservation, status: "Released" });

    const found = await repository.findById("reservation-1");
    expect(found?.status).toBe("Released");
    handle.close();
  });

  it("findActiveByProduct retorna apenas reservas com status Active", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockReservationRepository(handle.db);
    await repository.create(buildReservation({ reservationId: "r-1", status: "Active" }));
    await repository.create(buildReservation({ reservationId: "r-2", status: "Released" }));

    const found = await repository.findActiveByProduct("product-1");
    expect(found.map((r) => r.reservationId)).toEqual(["r-1"]);
    handle.close();
  });

  it("findByOrder retorna toda Reservation associada, independente do status", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockReservationRepository(handle.db);
    await repository.create(buildReservation({ reservationId: "r-1", status: "Active" }));
    await repository.update({ ...(await repository.findById("r-1"))!, status: "ConvertedToMovement" });

    const found = await repository.findByOrder("order-1");
    expect(found).toHaveLength(1);
    expect(found[0]?.status).toBe("ConvertedToMovement");
    handle.close();
  });

  it("expiresAt ausente é preservado como undefined, nunca como epoch zero", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockReservationRepository(handle.db);
    await repository.create(buildReservation());

    const found = await repository.findById("reservation-1");
    expect(found?.expiresAt).toBeUndefined();
    handle.close();
  });

  it("expiresAt explícito sobrevive à volta ao domínio", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockReservationRepository(handle.db);
    const expiresAt = new Date("2026-03-01T00:00:00.000Z");
    await repository.create(buildReservation({ expiresAt }));

    const found = await repository.findById("reservation-1");
    expect(found?.expiresAt?.toISOString()).toBe(expiresAt.toISOString());
    handle.close();
  });
});

describe("SqliteStockLocationRepository", () => {
  it("create e findById preservam o endereço achatado (address_line)", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockLocationRepository(handle.db);
    await repository.create(buildLocation({ address: { line: "Rua das Flores, 123" } }));

    const found = await repository.findById("location-1");
    expect(found?.address).toEqual({ line: "Rua das Flores, 123" });
    handle.close();
  });

  it("address ausente é preservado como undefined, nunca como objeto vazio", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockLocationRepository(handle.db);
    await repository.create(buildLocation());

    const found = await repository.findById("location-1");
    expect(found?.address).toBeUndefined();
    handle.close();
  });

  it("findAllActive isola por Tenant e nunca retorna Location inativa", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockLocationRepository(handle.db);
    await repository.create(buildLocation({ locationId: "l-1", tenantId: "tenant-1" }));
    await repository.create(buildLocation({ locationId: "l-2", tenantId: "tenant-2" }));

    const found = await repository.findAllActive("tenant-1");
    expect(found.map((l) => l.locationId)).toEqual(["l-1"]);
    handle.close();
  });
});

describe("SqliteStockAlertRuleRepository", () => {
  it("cria, desativa (active como INTEGER 0/1) e localiza por Produto", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockAlertRuleRepository(handle.db);
    const rule = await repository.create(buildRule());

    expect(await repository.findActiveByProduct("product-1")).toBeDefined();

    await repository.update({ ...rule, active: false });

    expect(await repository.findActiveByProduct("product-1")).toBeUndefined();
    const found = await repository.findById("rule-1");
    expect(found?.active).toBe(false);
    handle.close();
  });

  it("findActiveByProduct retorna undefined (nunca null) quando nenhuma Regra ativa existe", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteStockAlertRuleRepository(handle.db);

    expect(await repository.findActiveByProduct("product-sem-regra")).toBeUndefined();
    handle.close();
  });
});

describe("Inventory Movement — Persistência entre conexões", () => {
  it("um Stock Movement gravado por uma conexão sobrevive ao fechar e reabrir uma nova conexão contra o mesmo arquivo", async () => {
    const { mkdtempSync, rmSync } = await import("node:fs");
    const os = await import("node:os");
    const path = await import("node:path");

    const tempDir = mkdtempSync(path.join(os.tmpdir(), "abp-inventory-movement-persistence-test-"));
    const databasePath = path.join(tempDir, "test.sqlite3");

    try {
      const firstConnection = createDatabase({ environment: "testing", databasePath });
      runMigrations(firstConnection);
      const firstRepository = new SqliteStockMovementRepository(firstConnection.db);
      await firstRepository.append(buildMovement());
      firstConnection.close();

      const secondConnection = createDatabase({ environment: "testing", databasePath });
      const secondRepository = new SqliteStockMovementRepository(secondConnection.db);
      const found = await secondRepository.findByProduct("product-1");

      expect(found).toHaveLength(1);
      expect(found[0]?.quantityDelta).toBe(10);

      expect(() =>
        secondConnection.db.prepare("UPDATE stock_movements SET quantity_delta = ? WHERE movement_id = ?").run(1, "movement-1"),
      ).toThrow(/append-only/);

      secondConnection.close();
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
