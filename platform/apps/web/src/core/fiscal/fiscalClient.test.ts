import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fiscalClient } from "./fiscalClient.js";
import { startRealApiServer, type RealApiServer } from "./testing/realApiServer.js";
import type { TaxCalculationDto } from "./fiscal.dto.js";

/**
 * Integração real do Fiscal Hub — nenhum mock de `fetch`, chamada HTTP real contra uma instância real
 * de `apps/api` (Fastify + SQLite `:memory:`), per instrução explícita desta Sprint ("Sem mocks para
 * integração"). Servidor novo por teste, mesma disciplina de
 * `productionClient.test.ts`/`inventoryMovementClient.test.ts`/`purchaseClient.test.ts`/
 * `supplierClient.test.ts`.
 */
describe("fiscalClient — integração HTTP real (sem mock)", () => {
  let server: RealApiServer;

  beforeEach(async () => {
    server = await startRealApiServer();
  });

  afterEach(async () => {
    await server.close();
  });

  async function registerTaxRegimeAndRule(): Promise<{ taxRegimeId: string }> {
    const regime = await fiscalClient.registerTaxRegime({ tenantId: "tenant-1", name: "Simples Nacional" });
    await fiscalClient.createTaxRule({
      tenantId: "tenant-1",
      taxRegimeId: regime.taxRegimeId,
      classification: { code: "1234.56.78" },
      rate: { type: "Percentage", value: 10 },
      validFrom: new Date(Date.now() - 86_400_000).toISOString(),
    });
    return { taxRegimeId: regime.taxRegimeId };
  }

  it("registerTaxRegime -> findTaxRegimeByTenant, fim a fim contra o servidor real", async () => {
    const regime = await fiscalClient.registerTaxRegime({ tenantId: "tenant-1", name: "Simples Nacional" });
    expect(regime.tenantId).toBe("tenant-1");

    const found = await fiscalClient.findTaxRegimeByTenant("tenant-1");
    expect(found?.taxRegimeId).toBe(regime.taxRegimeId);
  });

  it("findTaxRegimeByTenant/findTaxRuleById/findFiscalDocumentById devolvem undefined (nunca lançam) quando ausentes", async () => {
    expect(await fiscalClient.findTaxRegimeByTenant("does-not-exist")).toBeUndefined();
    expect(await fiscalClient.findTaxRuleById("does-not-exist")).toBeUndefined();
    expect(await fiscalClient.findFiscalDocumentById("does-not-exist")).toBeUndefined();
  });

  it("createTaxRule -> findTaxRuleById -> deactivateTaxRule, nunca exclui o registro", async () => {
    const { taxRegimeId } = await registerTaxRegimeAndRule();
    const rule = await fiscalClient.findTaxRuleById((await fiscalClient.createTaxRule({
      tenantId: "tenant-1",
      taxRegimeId,
      classification: { code: "9999" },
      rate: { type: "Fixed", value: 5 },
      validFrom: new Date(Date.now() - 86_400_000).toISOString(),
    })).taxRuleId);
    expect(rule?.active).toBe(true);

    const deactivated = await fiscalClient.deactivateTaxRule(rule!.taxRuleId);
    expect(deactivated.active).toBe(false);
  });

  it("calculateTax aplica a Tax Rule vigente de forma determinística", async () => {
    const { taxRegimeId } = await registerTaxRegimeAndRule();

    const calculation = await fiscalClient.calculateTax({
      fiscalDocumentLineId: "line-1",
      taxRegimeId,
      classification: { code: "1234.56.78" },
      baseAmount: { amount: 100, currencyCode: "BRL" },
    });

    expect(calculation.amount).toEqual({ amount: 10, currencyCode: "BRL" });
  });

  it("calculateTax propaga erro real (nunca undefined) quando nenhuma Tax Rule vigente existe", async () => {
    const regime = await fiscalClient.registerTaxRegime({ tenantId: "tenant-1", name: "Simples Nacional" });

    await expect(
      fiscalClient.calculateTax({
        fiscalDocumentLineId: "line-1",
        taxRegimeId: regime.taxRegimeId,
        classification: { code: "1234.56.78" },
        baseAmount: { amount: 100, currencyCode: "BRL" },
      }),
    ).rejects.toThrow();
  });

  it("fluxo completo: registerTaxRegime -> createTaxRule -> calculateTax -> issueFiscalDocument -> listByOrigin -> cancel", async () => {
    const { taxRegimeId } = await registerTaxRegimeAndRule();
    const calculation: TaxCalculationDto = await fiscalClient.calculateTax({
      fiscalDocumentLineId: "line-1",
      taxRegimeId,
      classification: { code: "1234.56.78" },
      baseAmount: { amount: 100, currencyCode: "BRL" },
    });

    const document = await fiscalClient.issueFiscalDocument({
      tenantId: "tenant-1",
      type: "Sale",
      orderId: "order-1",
      lines: [
        {
          fiscalDocumentLineId: calculation.fiscalDocumentLineId,
          productId: "product-1",
          quantity: 2,
          unitValue: { amount: 50, currencyCode: "BRL" },
          classification: { code: "1234.56.78" },
          taxCalculation: calculation,
        },
      ],
    });
    expect(document.status).toBe("Issued");

    const found = await fiscalClient.findFiscalDocumentById(document.fiscalDocumentId);
    expect(found?.fiscalDocumentId).toBe(document.fiscalDocumentId);

    const byOrigin = await fiscalClient.listFiscalDocumentsByOrigin("order-1");
    expect(byOrigin.map((d) => d.fiscalDocumentId)).toEqual([document.fiscalDocumentId]);

    const cancelled = await fiscalClient.cancelFiscalDocument(document.fiscalDocumentId, { reason: "Devolução do cliente" });
    expect(cancelled.status).toBe("Cancelled");
  });

  it("registerFiscalObligation -> listPending -> fulfill; evaluateFiscalObligations transiciona vencida para Overdue", async () => {
    const obligation = await fiscalClient.registerFiscalObligation({
      tenantId: "tenant-1",
      type: "ICMS",
      periodicity: "Monthly",
      dueDate: new Date(Date.now() - 86_400_000).toISOString(),
    });
    expect(obligation.status).toBe("Pending");

    const pending = await fiscalClient.listPendingFiscalObligations();
    expect(pending.map((o) => o.fiscalObligationId)).toContain(obligation.fiscalObligationId);

    const evaluation = await fiscalClient.evaluateFiscalObligations({});
    expect(evaluation.overdue.map((o) => o.fiscalObligationId)).toContain(obligation.fiscalObligationId);

    const overdue = await fiscalClient.listOverdueFiscalObligations();
    expect(overdue.map((o) => o.fiscalObligationId)).toContain(obligation.fiscalObligationId);

    const fulfilled = await fiscalClient.fulfillFiscalObligation(obligation.fiscalObligationId);
    expect(fulfilled.status).toBe("Fulfilled");
  });

  it("FK second-write (auditoria IMP-603, verificada de novo neste cliente): issue seguido de cancel nunca falha por FOREIGN KEY", async () => {
    const { taxRegimeId } = await registerTaxRegimeAndRule();
    const calculation = await fiscalClient.calculateTax({
      fiscalDocumentLineId: "line-1",
      taxRegimeId,
      classification: { code: "1234.56.78" },
      baseAmount: { amount: 100, currencyCode: "BRL" },
    });
    const document = await fiscalClient.issueFiscalDocument({
      tenantId: "tenant-1",
      type: "Sale",
      orderId: "order-1",
      lines: [
        {
          fiscalDocumentLineId: calculation.fiscalDocumentLineId,
          productId: "product-1",
          quantity: 2,
          unitValue: { amount: 50, currencyCode: "BRL" },
          classification: { code: "1234.56.78" },
          taxCalculation: calculation,
        },
      ],
    });

    const cancelled = await fiscalClient.cancelFiscalDocument(document.fiscalDocumentId, { reason: "Devolução do cliente" });
    expect(cancelled.lines).toHaveLength(1);
  });

  it("PATCH-clobber: nenhum método deste cliente corresponde a uma atualização parcial", () => {
    const methodNames = Object.keys(fiscalClient);
    expect(methodNames.some((name) => /^(update|patch)/i.test(name))).toBe(false);
  });
});
