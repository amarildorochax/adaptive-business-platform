import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { FiscalDocument, FiscalDocumentLine, FiscalObligation, TaxRegime, TaxRule } from "@abp/fiscal-hub";
import { describe, expect, it } from "vitest";
import { createDatabase } from "../../db/client.js";
import { runMigrations } from "../../db/migrate.js";
import { createTestDatabase } from "../../testing/createTestDatabase.js";
import { SqliteFiscalDocumentRepository } from "./SqliteFiscalDocumentRepository.js";
import { SqliteFiscalObligationRepository } from "./SqliteFiscalObligationRepository.js";
import { SqliteTaxRegimeRepository } from "./SqliteTaxRegimeRepository.js";
import { SqliteTaxRuleRepository } from "./SqliteTaxRuleRepository.js";

function buildTaxRegime(overrides: Partial<TaxRegime> = {}): TaxRegime {
  return {
    taxRegimeId: "regime-1",
    tenantId: "tenant-1",
    name: "Simples Nacional",
    createdAt: new Date("2026-08-05T00:00:00Z"),
    ...overrides,
  };
}

function buildTaxRule(overrides: Partial<TaxRule> = {}): TaxRule {
  return {
    taxRuleId: "rule-1",
    tenantId: "tenant-1",
    taxRegimeId: "regime-1",
    classification: { code: "1234.56" },
    rate: { type: "Percentage", value: 18 },
    validFrom: new Date("2026-01-01T00:00:00Z"),
    active: true,
    createdAt: new Date("2026-08-05T00:00:00Z"),
    updatedAt: new Date("2026-08-05T00:00:00Z"),
    ...overrides,
  };
}

function buildLine(overrides: Partial<FiscalDocumentLine> = {}): FiscalDocumentLine {
  return {
    fiscalDocumentLineId: "line-1",
    productId: "product-1",
    quantity: 2,
    unitValue: { amount: 100, currencyCode: "BRL" },
    classification: { code: "1234.56" },
    taxCalculation: {
      taxCalculationId: "calc-1",
      fiscalDocumentLineId: "line-1",
      taxRuleId: "rule-1",
      amount: { amount: 36, currencyCode: "BRL" },
      calculatedAt: new Date("2026-08-05T00:00:00Z"),
    },
    ...overrides,
  };
}

function buildFiscalDocument(overrides: Partial<FiscalDocument> = {}): FiscalDocument {
  return {
    fiscalDocumentId: "doc-1",
    tenantId: "tenant-1",
    type: "Sale",
    orderId: "order-1",
    lines: [buildLine()],
    status: "Issued",
    issuedAt: new Date("2026-08-05T00:00:00Z"),
    createdAt: new Date("2026-08-05T00:00:00Z"),
    updatedAt: new Date("2026-08-05T00:00:00Z"),
    ...overrides,
  };
}

function buildFiscalObligation(overrides: Partial<FiscalObligation> = {}): FiscalObligation {
  return {
    fiscalObligationId: "obligation-1",
    tenantId: "tenant-1",
    type: "Declaração",
    periodicity: "Mensal",
    dueDate: new Date("2026-09-20T00:00:00Z"),
    status: "Pending",
    createdAt: new Date("2026-08-05T00:00:00Z"),
    updatedAt: new Date("2026-08-05T00:00:00Z"),
    ...overrides,
  };
}

describe("SqliteTaxRegimeRepository", () => {
  describe("CRUD", () => {
    it("save insere e findByTenant retorna o TaxRegime", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteTaxRegimeRepository(handle.db);

      await repository.save(buildTaxRegime());
      const found = await repository.findByTenant("tenant-1");

      expect(found?.name).toBe("Simples Nacional");
      handle.close();
    });

    it("save sobre um id existente atualiza (upsert), nunca duplica", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteTaxRegimeRepository(handle.db);

      await repository.save(buildTaxRegime());
      await repository.save(buildTaxRegime({ name: "Lucro Presumido" }));

      const count = handle.db.prepare("SELECT COUNT(*) as count FROM tax_regimes").get() as { count: number };
      expect(count.count).toBe(1);

      const found = await repository.findByTenant("tenant-1");
      expect(found?.name).toBe("Lucro Presumido");
      handle.close();
    });

    it("findByTenant retorna undefined para Tenant sem Tax Regime", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteTaxRegimeRepository(handle.db);

      expect(await repository.findByTenant("does-not-exist")).toBeUndefined();
      handle.close();
    });
  });

  describe("Constraints (UNIQUE)", () => {
    it("rejeita um segundo Tax Regime para o mesmo Tenant, com identificador diferente", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteTaxRegimeRepository(handle.db);

      await repository.save(buildTaxRegime({ taxRegimeId: "regime-1" }));

      await expect(repository.save(buildTaxRegime({ taxRegimeId: "regime-2" }))).rejects.toThrow();
      handle.close();
    });
  });

  describe("Persistência entre conexões", () => {
    it("TaxRegime sobrevive ao fechar e reabrir uma nova conexão contra o mesmo arquivo", async () => {
      const tempDir = mkdtempSync(path.join(os.tmpdir(), "abp-fiscal-regime-persistence-test-"));
      const databasePath = path.join(tempDir, "test.sqlite3");

      try {
        const firstConnection = createDatabase({ environment: "testing", databasePath });
        runMigrations(firstConnection);
        await new SqliteTaxRegimeRepository(firstConnection.db).save(buildTaxRegime());
        firstConnection.close();

        const secondConnection = createDatabase({ environment: "testing", databasePath });
        const found = await new SqliteTaxRegimeRepository(secondConnection.db).findByTenant("tenant-1");

        expect(found?.name).toBe("Simples Nacional");
        secondConnection.close();
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });
});

describe("SqliteTaxRuleRepository", () => {
  async function seedRegime(db: ReturnType<typeof createTestDatabase>["db"]) {
    await new SqliteTaxRegimeRepository(db).save(buildTaxRegime());
  }

  describe("CRUD", () => {
    it("save insere e findById retorna a TaxRule", async () => {
      const handle = createTestDatabase();
      await seedRegime(handle.db);
      const repository = new SqliteTaxRuleRepository(handle.db);

      await repository.save(buildTaxRule());
      const found = await repository.findById("rule-1");

      expect(found?.classification).toEqual({ code: "1234.56" });
      expect(found?.rate).toEqual({ type: "Percentage", value: 18 });
      expect(found?.active).toBe(true);
      handle.close();
    });

    it("save sobre um id existente atualiza (upsert) — usado por DeactivateTaxRule", async () => {
      const handle = createTestDatabase();
      await seedRegime(handle.db);
      const repository = new SqliteTaxRuleRepository(handle.db);

      await repository.save(buildTaxRule());
      await repository.save(buildTaxRule({ active: false }));

      const count = handle.db.prepare("SELECT COUNT(*) as count FROM tax_rules").get() as { count: number };
      expect(count.count).toBe(1);

      const found = await repository.findById("rule-1");
      expect(found?.active).toBe(false);
      handle.close();
    });

    it("findApplicable retorna a regra ativa e vigente na data informada", async () => {
      const handle = createTestDatabase();
      await seedRegime(handle.db);
      const repository = new SqliteTaxRuleRepository(handle.db);

      await repository.save(buildTaxRule());
      const found = await repository.findApplicable("regime-1", { code: "1234.56" }, new Date("2026-06-01"));

      expect(found?.taxRuleId).toBe("rule-1");
      handle.close();
    });

    it("findApplicable retorna undefined para regra inativa", async () => {
      const handle = createTestDatabase();
      await seedRegime(handle.db);
      const repository = new SqliteTaxRuleRepository(handle.db);

      await repository.save(buildTaxRule({ active: false }));
      expect(await repository.findApplicable("regime-1", { code: "1234.56" }, new Date("2026-06-01"))).toBeUndefined();
      handle.close();
    });

    it("findApplicable retorna undefined fora da janela de vigência", async () => {
      const handle = createTestDatabase();
      await seedRegime(handle.db);
      const repository = new SqliteTaxRuleRepository(handle.db);

      await repository.save(buildTaxRule({ validFrom: new Date("2026-01-01"), validUntil: new Date("2026-12-31") }));

      expect(await repository.findApplicable("regime-1", { code: "1234.56" }, new Date("2025-12-31"))).toBeUndefined();
      expect(await repository.findApplicable("regime-1", { code: "1234.56" }, new Date("2027-01-01"))).toBeUndefined();
      expect(await repository.findApplicable("regime-1", { code: "1234.56" }, new Date("2026-12-31"))).toBeDefined();
      handle.close();
    });

    it("findApplicable retorna undefined para classificação diferente", async () => {
      const handle = createTestDatabase();
      await seedRegime(handle.db);
      const repository = new SqliteTaxRuleRepository(handle.db);

      await repository.save(buildTaxRule());
      expect(await repository.findApplicable("regime-1", { code: "9999.99" }, new Date("2026-06-01"))).toBeUndefined();
      handle.close();
    });

    it("findById retorna undefined para identificador inexistente", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteTaxRuleRepository(handle.db);

      expect(await repository.findById("does-not-exist")).toBeUndefined();
      handle.close();
    });

    it("preserva exemptionCondition e validUntil opcionais como undefined quando ausentes", async () => {
      const handle = createTestDatabase();
      await seedRegime(handle.db);
      const repository = new SqliteTaxRuleRepository(handle.db);

      await repository.save(buildTaxRule());
      const found = await repository.findById("rule-1");

      expect(found?.exemptionCondition).toBeUndefined();
      expect(found?.validUntil).toBeUndefined();
      handle.close();
    });
  });

  describe("Constraints (Foreign Keys)", () => {
    it("save rejeita referenciar um Tax Regime inexistente", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteTaxRuleRepository(handle.db);

      await expect(repository.save(buildTaxRule({ taxRegimeId: "does-not-exist" }))).rejects.toThrow();
      handle.close();
    });
  });

  describe("Persistência entre conexões", () => {
    it("TaxRule sobrevive ao fechar e reabrir uma nova conexão contra o mesmo arquivo", async () => {
      const tempDir = mkdtempSync(path.join(os.tmpdir(), "abp-fiscal-rule-persistence-test-"));
      const databasePath = path.join(tempDir, "test.sqlite3");

      try {
        const firstConnection = createDatabase({ environment: "testing", databasePath });
        runMigrations(firstConnection);
        await new SqliteTaxRegimeRepository(firstConnection.db).save(buildTaxRegime());
        await new SqliteTaxRuleRepository(firstConnection.db).save(buildTaxRule());
        firstConnection.close();

        const secondConnection = createDatabase({ environment: "testing", databasePath });
        const found = await new SqliteTaxRuleRepository(secondConnection.db).findById("rule-1");

        expect(found?.rate.value).toBe(18);
        secondConnection.close();
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });
});

describe("SqliteFiscalDocumentRepository", () => {
  async function seedRegimeAndRule(db: ReturnType<typeof createTestDatabase>["db"]) {
    await new SqliteTaxRegimeRepository(db).save(buildTaxRegime());
    await new SqliteTaxRuleRepository(db).save(buildTaxRule());
  }

  describe("CRUD", () => {
    it("save insere e findById retorna o FiscalDocument com suas linhas e o Tax Calculation hidratado", async () => {
      const handle = createTestDatabase();
      await seedRegimeAndRule(handle.db);
      const repository = new SqliteFiscalDocumentRepository(handle.db);

      await repository.save(buildFiscalDocument());
      const found = await repository.findById("doc-1");

      expect(found?.status).toBe("Issued");
      expect(found?.lines).toHaveLength(1);
      expect(found?.lines[0]?.taxCalculation).toEqual({
        taxCalculationId: "calc-1",
        fiscalDocumentLineId: "line-1",
        taxRuleId: "rule-1",
        amount: { amount: 36, currencyCode: "BRL" },
        calculatedAt: new Date("2026-08-05T00:00:00Z"),
      });
      handle.close();
    });

    it("save sobre um id existente atualiza (upsert), nunca duplica — usado por CancelFiscalDocument", async () => {
      const handle = createTestDatabase();
      await seedRegimeAndRule(handle.db);
      const repository = new SqliteFiscalDocumentRepository(handle.db);

      await repository.save(buildFiscalDocument());
      await repository.save(buildFiscalDocument({ status: "Cancelled", cancelledAt: new Date("2026-08-06T00:00:00Z"), cancelReason: "Erro de emissão" }));

      const count = handle.db.prepare("SELECT COUNT(*) as count FROM fiscal_documents").get() as { count: number };
      expect(count.count).toBe(1);

      const found = await repository.findById("doc-1");
      expect(found?.status).toBe("Cancelled");
      expect(found?.cancelReason).toBe("Erro de emissão");
      handle.close();
    });

    it("save regrava por completo fiscal_document_lines a cada chamada — nunca acumula linhas antigas", async () => {
      const handle = createTestDatabase();
      await seedRegimeAndRule(handle.db);
      const repository = new SqliteFiscalDocumentRepository(handle.db);

      await repository.save(buildFiscalDocument({ lines: [buildLine({ fiscalDocumentLineId: "line-1" })] }));
      await repository.save(
        buildFiscalDocument({
          lines: [
            buildLine({ fiscalDocumentLineId: "line-1" }),
            buildLine({
              fiscalDocumentLineId: "line-2",
              taxCalculation: { ...buildLine().taxCalculation, taxCalculationId: "calc-2", fiscalDocumentLineId: "line-2" },
            }),
          ],
        }),
      );

      const found = await repository.findById("doc-1");
      expect(found?.lines).toHaveLength(2);
      handle.close();
    });

    it("findByOrigin filtra por orderId, retornando lista vazia quando ausente", async () => {
      const handle = createTestDatabase();
      await seedRegimeAndRule(handle.db);
      const repository = new SqliteFiscalDocumentRepository(handle.db);

      await repository.save(buildFiscalDocument({ fiscalDocumentId: "doc-1", orderId: "order-99" }));
      await repository.save(buildFiscalDocument({ fiscalDocumentId: "doc-2", orderId: "order-other", lines: [] }));

      expect((await repository.findByOrigin("order-99")).map((d) => d.fiscalDocumentId)).toEqual(["doc-1"]);
      expect(await repository.findByOrigin("order-does-not-exist")).toEqual([]);
      handle.close();
    });

    it("findById retorna undefined para identificador inexistente", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteFiscalDocumentRepository(handle.db);

      expect(await repository.findById("does-not-exist")).toBeUndefined();
      handle.close();
    });

    it("preserva invoiceId como origem alternativa a orderId, e number/series/cancelReason ausentes como undefined", async () => {
      const handle = createTestDatabase();
      await seedRegimeAndRule(handle.db);
      const repository = new SqliteFiscalDocumentRepository(handle.db);

      await repository.save(buildFiscalDocument({ orderId: undefined, invoiceId: "invoice-1" }));
      const found = await repository.findById("doc-1");

      expect(found?.orderId).toBeUndefined();
      expect(found?.invoiceId).toBe("invoice-1");
      expect(found?.number).toBeUndefined();
      expect(found?.series).toBeUndefined();
      expect(found?.cancelReason).toBeUndefined();
      expect(found?.cancelledAt).toBeUndefined();
      handle.close();
    });

    it("aceita e persiste um FiscalDocument sem nenhuma linha", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteFiscalDocumentRepository(handle.db);

      await repository.save(buildFiscalDocument({ lines: [] }));
      const found = await repository.findById("doc-1");

      expect(found?.lines).toEqual([]);
      handle.close();
    });
  });

  describe("Constraints (Foreign Keys)", () => {
    it("save rejeita uma linha referenciando uma Tax Rule inexistente", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteFiscalDocumentRepository(handle.db);

      await expect(
        repository.save(
          buildFiscalDocument({
            lines: [buildLine({ taxCalculation: { ...buildLine().taxCalculation, taxRuleId: "does-not-exist" } })],
          }),
        ),
      ).rejects.toThrow();
      handle.close();
    });

    it("fiscal_document_lines rejeita inserção direta referenciando um FiscalDocument inexistente", () => {
      const handle = createTestDatabase();

      expect(() =>
        handle.db
          .prepare(
            `INSERT INTO fiscal_document_lines (
               fiscal_document_line_id, fiscal_document_id, product_id, quantity, unit_value_amount,
               unit_value_currency_code, classification_code, tax_calculation_id, tax_rule_id,
               tax_amount_amount, tax_amount_currency_code, tax_calculated_at
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .run("line-x", "does-not-exist", "product-1", 1, 10, "BRL", "1234", "calc-x", "rule-x", 1, "BRL", Date.now()),
      ).toThrow();
      handle.close();
    });
  });

  describe("Rollback (atomicidade)", () => {
    it("save reverte o FiscalDocument já inserido quando a inserção de uma line falha na mesma transação", async () => {
      const handle = createTestDatabase();
      await seedRegimeAndRule(handle.db);
      const repository = new SqliteFiscalDocumentRepository(handle.db);

      const validLine = buildLine({ fiscalDocumentLineId: "line-1" });
      const invalidLine = buildLine({
        fiscalDocumentLineId: "line-2",
        taxCalculation: { ...buildLine().taxCalculation, fiscalDocumentLineId: "line-2", taxRuleId: "does-not-exist" },
      });

      await expect(
        repository.save(buildFiscalDocument({ fiscalDocumentId: "doc-rollback", lines: [validLine, invalidLine] })),
      ).rejects.toThrow();

      const rawRow = handle.db.prepare("SELECT * FROM fiscal_documents WHERE fiscal_document_id = ?").get("doc-rollback");
      expect(rawRow).toBeUndefined();
      const rawLines = handle.db.prepare("SELECT * FROM fiscal_document_lines WHERE fiscal_document_id = ?").all("doc-rollback");
      expect(rawLines).toHaveLength(0);
      handle.close();
    });
  });

  describe("Persistência entre conexões", () => {
    it("FiscalDocument + linhas sobrevivem ao fechar e reabrir uma nova conexão contra o mesmo arquivo", async () => {
      const tempDir = mkdtempSync(path.join(os.tmpdir(), "abp-fiscal-document-persistence-test-"));
      const databasePath = path.join(tempDir, "test.sqlite3");

      try {
        const firstConnection = createDatabase({ environment: "testing", databasePath });
        runMigrations(firstConnection);
        await new SqliteTaxRegimeRepository(firstConnection.db).save(buildTaxRegime());
        await new SqliteTaxRuleRepository(firstConnection.db).save(buildTaxRule());
        await new SqliteFiscalDocumentRepository(firstConnection.db).save(buildFiscalDocument());
        firstConnection.close();

        const secondConnection = createDatabase({ environment: "testing", databasePath });
        const found = await new SqliteFiscalDocumentRepository(secondConnection.db).findById("doc-1");

        expect(found?.status).toBe("Issued");
        expect(found?.lines).toHaveLength(1);
        expect(found?.lines[0]?.taxCalculation.amount.amount).toBe(36);
        secondConnection.close();
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });
});

describe("SqliteFiscalObligationRepository", () => {
  describe("CRUD", () => {
    it("save insere e findById retorna o FiscalObligation", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteFiscalObligationRepository(handle.db);

      await repository.save(buildFiscalObligation());
      const found = await repository.findById("obligation-1");

      expect(found?.status).toBe("Pending");
      expect(found?.type).toBe("Declaração");
      handle.close();
    });

    it("save sobre um id existente atualiza (upsert), nunca duplica", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteFiscalObligationRepository(handle.db);

      await repository.save(buildFiscalObligation());
      await repository.save(buildFiscalObligation({ status: "Fulfilled", fulfilledAt: new Date("2026-09-01T00:00:00Z") }));

      const count = handle.db.prepare("SELECT COUNT(*) as count FROM fiscal_obligations").get() as { count: number };
      expect(count.count).toBe(1);

      const found = await repository.findById("obligation-1");
      expect(found?.status).toBe("Fulfilled");
      expect(found?.fulfilledAt).toEqual(new Date("2026-09-01T00:00:00Z"));
      handle.close();
    });

    it("findPending retorna apenas obrigações Pending", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteFiscalObligationRepository(handle.db);

      await repository.save(buildFiscalObligation({ fiscalObligationId: "obligation-1", status: "Pending" }));
      await repository.save(buildFiscalObligation({ fiscalObligationId: "obligation-2", status: "Overdue" }));

      const pending = await repository.findPending();
      expect(pending.map((o) => o.fiscalObligationId)).toEqual(["obligation-1"]);
      handle.close();
    });

    it("findOverdue retorna apenas obrigações Overdue", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteFiscalObligationRepository(handle.db);

      await repository.save(buildFiscalObligation({ fiscalObligationId: "obligation-1", status: "Pending" }));
      await repository.save(buildFiscalObligation({ fiscalObligationId: "obligation-2", status: "Overdue" }));

      const overdue = await repository.findOverdue();
      expect(overdue.map((o) => o.fiscalObligationId)).toEqual(["obligation-2"]);
      handle.close();
    });

    it("findById retorna undefined para identificador inexistente", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteFiscalObligationRepository(handle.db);

      expect(await repository.findById("does-not-exist")).toBeUndefined();
      handle.close();
    });

    it("fulfilledAt ausente é preservado como undefined, nunca como epoch zero", async () => {
      const handle = createTestDatabase();
      const repository = new SqliteFiscalObligationRepository(handle.db);

      await repository.save(buildFiscalObligation());
      const found = await repository.findById("obligation-1");

      expect(found?.fulfilledAt).toBeUndefined();
      handle.close();
    });
  });

  describe("Persistência entre conexões", () => {
    it("FiscalObligation sobrevive ao fechar e reabrir uma nova conexão contra o mesmo arquivo", async () => {
      const tempDir = mkdtempSync(path.join(os.tmpdir(), "abp-fiscal-obligation-persistence-test-"));
      const databasePath = path.join(tempDir, "test.sqlite3");

      try {
        const firstConnection = createDatabase({ environment: "testing", databasePath });
        runMigrations(firstConnection);
        await new SqliteFiscalObligationRepository(firstConnection.db).save(buildFiscalObligation());
        firstConnection.close();

        const secondConnection = createDatabase({ environment: "testing", databasePath });
        const found = await new SqliteFiscalObligationRepository(secondConnection.db).findById("obligation-1");

        expect(found?.periodicity).toBe("Mensal");
        secondConnection.close();
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });
});
