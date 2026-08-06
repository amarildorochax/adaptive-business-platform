import { describe, expect, it } from "vitest";
import { buildTestServer } from "../testing/buildTestServer.js";

async function registerTaxRegime(fastify: Awaited<ReturnType<typeof buildTestServer>>, overrides: Record<string, unknown> = {}) {
  const response = await fastify.inject({
    method: "POST",
    url: "/tax-regimes",
    payload: { tenantId: "tenant-1", name: "Simples Nacional", ...overrides },
  });
  return response.json() as { taxRegimeId: string; tenantId: string };
}

async function createTaxRule(fastify: Awaited<ReturnType<typeof buildTestServer>>, taxRegimeId: string, overrides: Record<string, unknown> = {}) {
  const response = await fastify.inject({
    method: "POST",
    url: "/tax-rules",
    payload: {
      tenantId: "tenant-1",
      taxRegimeId,
      classification: { code: "1234.56.78" },
      rate: { type: "Percentage", value: 10 },
      validFrom: new Date(Date.now() - 86_400_000).toISOString(),
      ...overrides,
    },
  });
  return response.json() as { taxRuleId: string; active: boolean };
}

async function calculateTax(fastify: Awaited<ReturnType<typeof buildTestServer>>, taxRegimeId: string, overrides: Record<string, unknown> = {}) {
  const response = await fastify.inject({
    method: "POST",
    url: "/tax-calculations",
    payload: {
      fiscalDocumentLineId: "line-1",
      taxRegimeId,
      classification: { code: "1234.56.78" },
      baseAmount: { amount: 100, currencyCode: "BRL" },
      ...overrides,
    },
  });
  return response;
}

async function issueFiscalDocument(
  fastify: Awaited<ReturnType<typeof buildTestServer>>,
  taxCalculation: { taxCalculationId: string; fiscalDocumentLineId: string; taxRuleId: string; amount: { amount: number; currencyCode: string }; calculatedAt: string },
  overrides: Record<string, unknown> = {},
) {
  const response = await fastify.inject({
    method: "POST",
    url: "/fiscal-documents",
    payload: {
      tenantId: "tenant-1",
      type: "Sale",
      orderId: "order-1",
      lines: [
        {
          fiscalDocumentLineId: taxCalculation.fiscalDocumentLineId,
          productId: "product-1",
          quantity: 2,
          unitValue: { amount: 50, currencyCode: "BRL" },
          classification: { code: "1234.56.78" },
          taxCalculation,
        },
      ],
      ...overrides,
    },
  });
  return response;
}

async function registerFiscalObligation(fastify: Awaited<ReturnType<typeof buildTestServer>>, overrides: Record<string, unknown> = {}) {
  const response = await fastify.inject({
    method: "POST",
    url: "/fiscal-obligations",
    payload: { tenantId: "tenant-1", type: "ICMS", periodicity: "Monthly", dueDate: new Date().toISOString(), ...overrides },
  });
  return response.json() as { fiscalObligationId: string; status: string };
}

describe("Rotas HTTP — Tax Regime", () => {
  it("POST /tax-regimes — 201, registra o Tax Regime de um Tenant", async () => {
    const fastify = await buildTestServer();
    const response = await fastify.inject({ method: "POST", url: "/tax-regimes", payload: { tenantId: "tenant-1", name: "Simples Nacional" } });

    expect(response.statusCode).toBe(201);
    const body = response.json() as { tenantId: string; name: string };
    expect(body.tenantId).toBe("tenant-1");
    expect(body.name).toBe("Simples Nacional");
    await fastify.close();
  });

  it("POST /tax-regimes — 400, schema rejeita corpo sem name", async () => {
    const fastify = await buildTestServer();
    const response = await fastify.inject({ method: "POST", url: "/tax-regimes", payload: { tenantId: "tenant-1" } });
    expect(response.statusCode).toBe(400);
    await fastify.close();
  });

  it("POST /tax-regimes — 422, name apenas com espaços passa pelo schema mas é rejeitado pelo Core (InvalidTaxRegimeNameError)", async () => {
    const fastify = await buildTestServer();
    const response = await fastify.inject({ method: "POST", url: "/tax-regimes", payload: { tenantId: "tenant-1", name: "   " } });
    expect(response.statusCode).toBe(422);
    await fastify.close();
  });

  it("POST /tax-regimes — 409, Tenant já possui um Tax Regime registrado (DuplicateTaxRegimeError)", async () => {
    const fastify = await buildTestServer();
    await registerTaxRegime(fastify);

    const second = await fastify.inject({ method: "POST", url: "/tax-regimes", payload: { tenantId: "tenant-1", name: "Lucro Real" } });
    expect(second.statusCode).toBe(409);
    await fastify.close();
  });

  it("GET /tax-regimes/:tenantId — 200 e 404", async () => {
    const fastify = await buildTestServer();
    await registerTaxRegime(fastify);

    const found = await fastify.inject({ method: "GET", url: "/tax-regimes/tenant-1" });
    expect(found.statusCode).toBe(200);

    const missing = await fastify.inject({ method: "GET", url: "/tax-regimes/does-not-exist" });
    expect(missing.statusCode).toBe(404);
    await fastify.close();
  });
});

describe("Rotas HTTP — Tax Rule", () => {
  it("POST /tax-rules — 201, cria uma Tax Rule ativa", async () => {
    const fastify = await buildTestServer();
    const regime = await registerTaxRegime(fastify);

    const response = await fastify.inject({
      method: "POST",
      url: "/tax-rules",
      payload: {
        tenantId: "tenant-1",
        taxRegimeId: regime.taxRegimeId,
        classification: { code: "1234.56.78" },
        rate: { type: "Percentage", value: 10 },
        validFrom: new Date(Date.now() - 86_400_000).toISOString(),
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json() as { active: boolean; rate: { type: string; value: number } };
    expect(body.active).toBe(true);
    expect(body.rate).toEqual({ type: "Percentage", value: 10 });
    await fastify.close();
  });

  it("POST /tax-rules — 400, schema rejeita classification.code vazio", async () => {
    const fastify = await buildTestServer();
    const regime = await registerTaxRegime(fastify);

    const response = await fastify.inject({
      method: "POST",
      url: "/tax-rules",
      payload: {
        tenantId: "tenant-1",
        taxRegimeId: regime.taxRegimeId,
        classification: { code: "" },
        rate: { type: "Percentage", value: 10 },
        validFrom: new Date().toISOString(),
      },
    });
    expect(response.statusCode).toBe(400);
    await fastify.close();
  });

  it("POST /tax-rules — 422, rate.value negativo passa pelo schema mas é rejeitado pelo Core (InvalidTaxRateError)", async () => {
    const fastify = await buildTestServer();
    const regime = await registerTaxRegime(fastify);

    const response = await fastify.inject({
      method: "POST",
      url: "/tax-rules",
      payload: {
        tenantId: "tenant-1",
        taxRegimeId: regime.taxRegimeId,
        classification: { code: "1234.56.78" },
        rate: { type: "Percentage", value: -5 },
        validFrom: new Date().toISOString(),
      },
    });
    expect(response.statusCode).toBe(422);
    await fastify.close();
  });

  it("GET /tax-rules/:taxRuleId — 200 e 404", async () => {
    const fastify = await buildTestServer();
    const regime = await registerTaxRegime(fastify);
    const rule = await createTaxRule(fastify, regime.taxRegimeId);

    const found = await fastify.inject({ method: "GET", url: `/tax-rules/${rule.taxRuleId}` });
    expect(found.statusCode).toBe(200);

    const missing = await fastify.inject({ method: "GET", url: "/tax-rules/does-not-exist" });
    expect(missing.statusCode).toBe(404);
    await fastify.close();
  });

  it("POST /tax-rules/:taxRuleId/deactivate — 200, nunca exclui o registro; 404 para identificador inexistente", async () => {
    const fastify = await buildTestServer();
    const regime = await registerTaxRegime(fastify);
    const rule = await createTaxRule(fastify, regime.taxRegimeId);

    const response = await fastify.inject({ method: "POST", url: `/tax-rules/${rule.taxRuleId}/deactivate` });
    expect(response.statusCode).toBe(200);
    expect((response.json() as { active: boolean }).active).toBe(false);

    const missing = await fastify.inject({ method: "POST", url: "/tax-rules/does-not-exist/deactivate" });
    expect(missing.statusCode).toBe(404);
    await fastify.close();
  });
});

describe("Rotas HTTP — Tax Calculation", () => {
  it("POST /tax-calculations — 201, aplica a Tax Rule vigente de forma determinística (10% de 100 BRL = 10 BRL)", async () => {
    const fastify = await buildTestServer();
    const regime = await registerTaxRegime(fastify);
    await createTaxRule(fastify, regime.taxRegimeId);

    const response = await calculateTax(fastify, regime.taxRegimeId);
    expect(response.statusCode).toBe(201);
    const body = response.json() as { amount: { amount: number; currencyCode: string }; taxRuleId: string };
    expect(body.amount).toEqual({ amount: 10, currencyCode: "BRL" });
    await fastify.close();
  });

  it("POST /tax-calculations — 404, nenhuma Tax Rule vigente encontrada (NoApplicableTaxRuleFoundError)", async () => {
    const fastify = await buildTestServer();
    const regime = await registerTaxRegime(fastify);
    // Regra com vigência apenas no futuro — inaplicável na data padrão do cálculo (agora).
    await createTaxRule(fastify, regime.taxRegimeId, { validFrom: new Date(Date.now() + 86_400_000).toISOString() });

    const response = await calculateTax(fastify, regime.taxRegimeId);
    expect(response.statusCode).toBe(404);
    await fastify.close();
  });

  it("POST /tax-calculations — 422, baseAmount negativo passa pelo schema mas é rejeitado pelo Core (InvalidMoneyError)", async () => {
    const fastify = await buildTestServer();
    const regime = await registerTaxRegime(fastify);
    await createTaxRule(fastify, regime.taxRegimeId);

    const response = await calculateTax(fastify, regime.taxRegimeId, { baseAmount: { amount: -10, currencyCode: "BRL" } });
    expect(response.statusCode).toBe(422);
    await fastify.close();
  });
});

describe("Rotas HTTP — Fiscal Document", () => {
  it("POST /fiscal-documents — 201, emite com Tax Calculation já aplicado a cada linha", async () => {
    const fastify = await buildTestServer();
    const regime = await registerTaxRegime(fastify);
    await createTaxRule(fastify, regime.taxRegimeId);
    const calculation = (await calculateTax(fastify, regime.taxRegimeId)).json() as {
      taxCalculationId: string;
      fiscalDocumentLineId: string;
      taxRuleId: string;
      amount: { amount: number; currencyCode: string };
      calculatedAt: string;
    };

    const response = await issueFiscalDocument(fastify, calculation);
    expect(response.statusCode).toBe(201);
    const body = response.json() as { status: string; lines: unknown[] };
    expect(body.status).toBe("Issued");
    expect(body.lines).toHaveLength(1);
    await fastify.close();
  });

  it("POST /fiscal-documents — 422, sem orderId nem invoiceId (FiscalDocumentMissingOriginError)", async () => {
    const fastify = await buildTestServer();
    const regime = await registerTaxRegime(fastify);
    await createTaxRule(fastify, regime.taxRegimeId);
    const calculation = (await calculateTax(fastify, regime.taxRegimeId)).json() as never;

    const response = await issueFiscalDocument(fastify, calculation, { orderId: undefined });
    expect(response.statusCode).toBe(422);
    await fastify.close();
  });

  it("POST /fiscal-documents — 422, quantity não positiva passa pelo schema mas é rejeitada pelo Core (InvalidFiscalDocumentLineError)", async () => {
    const fastify = await buildTestServer();
    const regime = await registerTaxRegime(fastify);
    await createTaxRule(fastify, regime.taxRegimeId);
    const calculation = (await calculateTax(fastify, regime.taxRegimeId)).json() as never;

    const response = await fastify.inject({
      method: "POST",
      url: "/fiscal-documents",
      payload: {
        tenantId: "tenant-1",
        type: "Sale",
        orderId: "order-1",
        lines: [
          {
            fiscalDocumentLineId: "line-1",
            productId: "product-1",
            quantity: 0,
            unitValue: { amount: 50, currencyCode: "BRL" },
            classification: { code: "1234.56.78" },
            taxCalculation: calculation,
          },
        ],
      },
    });
    expect(response.statusCode).toBe(422);
    await fastify.close();
  });

  it("GET /fiscal-documents/:fiscalDocumentId — 200 e 404", async () => {
    const fastify = await buildTestServer();
    const regime = await registerTaxRegime(fastify);
    await createTaxRule(fastify, regime.taxRegimeId);
    const calculation = (await calculateTax(fastify, regime.taxRegimeId)).json() as never;
    const document = (await issueFiscalDocument(fastify, calculation)).json() as { fiscalDocumentId: string };

    const found = await fastify.inject({ method: "GET", url: `/fiscal-documents/${document.fiscalDocumentId}` });
    expect(found.statusCode).toBe(200);

    const missing = await fastify.inject({ method: "GET", url: "/fiscal-documents/does-not-exist" });
    expect(missing.statusCode).toBe(404);
    await fastify.close();
  });

  it("GET /fiscal-documents/by-origin/:orderId — filtra por orderId, vazio quando ausente", async () => {
    const fastify = await buildTestServer();
    const regime = await registerTaxRegime(fastify);
    await createTaxRule(fastify, regime.taxRegimeId);
    const calculation = (await calculateTax(fastify, regime.taxRegimeId)).json() as never;
    const document = (await issueFiscalDocument(fastify, calculation, { orderId: "order-99" })).json() as { fiscalDocumentId: string };

    const found = await fastify.inject({ method: "GET", url: "/fiscal-documents/by-origin/order-99" });
    expect((found.json() as { fiscalDocumentId: string }[]).map((d) => d.fiscalDocumentId)).toEqual([document.fiscalDocumentId]);

    const empty = await fastify.inject({ method: "GET", url: "/fiscal-documents/by-origin/does-not-exist" });
    expect(empty.json()).toEqual([]);
    await fastify.close();
  });

  it("POST /fiscal-documents/:id/cancel — 200, única transição posterior permitida; 409 ao cancelar duas vezes; 404 para inexistente", async () => {
    const fastify = await buildTestServer();
    const regime = await registerTaxRegime(fastify);
    await createTaxRule(fastify, regime.taxRegimeId);
    const calculation = (await calculateTax(fastify, regime.taxRegimeId)).json() as never;
    const document = (await issueFiscalDocument(fastify, calculation)).json() as { fiscalDocumentId: string };

    const response = await fastify.inject({
      method: "POST",
      url: `/fiscal-documents/${document.fiscalDocumentId}/cancel`,
      payload: { reason: "Devolução do cliente" },
    });
    expect(response.statusCode).toBe(200);
    expect((response.json() as { status: string; cancelReason: string }).status).toBe("Cancelled");

    const second = await fastify.inject({
      method: "POST",
      url: `/fiscal-documents/${document.fiscalDocumentId}/cancel`,
      payload: { reason: "tentativa duplicada" },
    });
    expect(second.statusCode).toBe(409);

    const missing = await fastify.inject({ method: "POST", url: "/fiscal-documents/does-not-exist/cancel", payload: { reason: "x" } });
    expect(missing.statusCode).toBe(404);
    await fastify.close();
  });
});

describe("Rotas HTTP — Fiscal Obligation", () => {
  it("POST /fiscal-obligations — 201, registra em Pending", async () => {
    const fastify = await buildTestServer();
    const obligation = await registerFiscalObligation(fastify);
    expect(obligation.status).toBe("Pending");
    await fastify.close();
  });

  it("POST /fiscal-obligations — 400, schema rejeita corpo sem type", async () => {
    const fastify = await buildTestServer();
    const response = await fastify.inject({
      method: "POST",
      url: "/fiscal-obligations",
      payload: { tenantId: "tenant-1", periodicity: "Monthly", dueDate: new Date().toISOString() },
    });
    expect(response.statusCode).toBe(400);
    await fastify.close();
  });

  it("POST /fiscal-obligations — 422, type apenas com espaços passa pelo schema mas é rejeitado pelo Core (InvalidFiscalObligationError)", async () => {
    const fastify = await buildTestServer();
    const response = await fastify.inject({
      method: "POST",
      url: "/fiscal-obligations",
      payload: { tenantId: "tenant-1", type: "   ", periodicity: "Monthly", dueDate: new Date().toISOString() },
    });
    expect(response.statusCode).toBe(422);
    await fastify.close();
  });

  it("GET /fiscal-obligations/pending — lista as recém-registradas", async () => {
    const fastify = await buildTestServer();
    await registerFiscalObligation(fastify);

    const response = await fastify.inject({ method: "GET", url: "/fiscal-obligations/pending" });
    expect(response.statusCode).toBe(200);
    expect((response.json() as unknown[]).length).toBeGreaterThan(0);
    await fastify.close();
  });

  it("POST /fiscal-obligations/:id/fulfill — 200; 409 ao cumprir duas vezes; 404 para inexistente", async () => {
    const fastify = await buildTestServer();
    const obligation = await registerFiscalObligation(fastify);

    const response = await fastify.inject({ method: "POST", url: `/fiscal-obligations/${obligation.fiscalObligationId}/fulfill` });
    expect(response.statusCode).toBe(200);
    expect((response.json() as { status: string }).status).toBe("Fulfilled");

    const second = await fastify.inject({ method: "POST", url: `/fiscal-obligations/${obligation.fiscalObligationId}/fulfill` });
    expect(second.statusCode).toBe(409);

    const missing = await fastify.inject({ method: "POST", url: "/fiscal-obligations/does-not-exist/fulfill" });
    expect(missing.statusCode).toBe(404);
    await fastify.close();
  });

  it("POST /fiscal-obligations/evaluate-overdue — 200, transiciona Pending vencido para Overdue e publica no resultado", async () => {
    const fastify = await buildTestServer();
    const overdue = await registerFiscalObligation(fastify, { dueDate: new Date(Date.now() - 86_400_000).toISOString() });
    const notYetDue = await registerFiscalObligation(fastify, { dueDate: new Date(Date.now() + 86_400_000).toISOString() });

    const response = await fastify.inject({ method: "POST", url: "/fiscal-obligations/evaluate-overdue", payload: {} });
    expect(response.statusCode).toBe(200);
    const body = response.json() as { overdue: { fiscalObligationId: string; status: string }[] };
    expect(body.overdue.map((o) => o.fiscalObligationId)).toEqual([overdue.fiscalObligationId]);
    expect(body.overdue.map((o) => o.fiscalObligationId)).not.toContain(notYetDue.fiscalObligationId);

    const overdueList = await fastify.inject({ method: "GET", url: "/fiscal-obligations/overdue" });
    expect((overdueList.json() as { fiscalObligationId: string }[]).map((o) => o.fiscalObligationId)).toEqual([overdue.fiscalObligationId]);

    const fulfillFromOverdue = await fastify.inject({ method: "POST", url: `/fiscal-obligations/${overdue.fiscalObligationId}/fulfill` });
    expect(fulfillFromOverdue.statusCode).toBe(200);
    await fastify.close();
  });
});

describe("Rotas HTTP — Auditoria de classes de bug conhecidas", () => {
  const fiscalPaths = ["/tax-regimes/x", "/tax-rules/x", "/tax-calculations/x", "/fiscal-documents/x", "/fiscal-obligations/x"];

  it("PATCH-clobber (IMP-203) — nenhuma superfície: nenhuma rota PATCH existe neste Hub", async () => {
    const fastify = await buildTestServer();
    for (const path of fiscalPaths) {
      const response = await fastify.inject({ method: "PATCH", url: path, payload: {} });
      expect(response.statusCode).toBe(404);
    }
    await fastify.close();
  });

  it("Ledger immutability (IMP-403) — não se aplica (FiscalDocument/FiscalObligation são máquinas de estados); propriedade análoga verificada: nenhuma rota PUT/DELETE existe neste Hub", async () => {
    const fastify = await buildTestServer();
    for (const path of fiscalPaths) {
      const put = await fastify.inject({ method: "PUT", url: path, payload: {} });
      expect(put.statusCode).toBe(404);
      const del = await fastify.inject({ method: "DELETE", url: path });
      expect(del.statusCode).toBe(404);
    }
    await fastify.close();
  });

  it("FK second-write (IMP-303) — nenhuma superfície: cancelar um Fiscal Document regrava fiscal_document_lines por completo, nunca falha por FOREIGN KEY", async () => {
    const fastify = await buildTestServer();
    const regime = await registerTaxRegime(fastify);
    await createTaxRule(fastify, regime.taxRegimeId);
    const calculation = (await calculateTax(fastify, regime.taxRegimeId)).json() as never;
    const document = (await issueFiscalDocument(fastify, calculation)).json() as { fiscalDocumentId: string };

    const cancel = await fastify.inject({
      method: "POST",
      url: `/fiscal-documents/${document.fiscalDocumentId}/cancel`,
      payload: { reason: "Devolução do cliente" },
    });
    expect(cancel.statusCode).toBe(200);

    const found = await fastify.inject({ method: "GET", url: `/fiscal-documents/${document.fiscalDocumentId}` });
    expect((found.json() as { lines: unknown[] }).lines).toHaveLength(1);
    await fastify.close();
  });
});

describe("Rotas HTTP — OpenAPI", () => {
  it("expõe todos os quinze endpoints com a tag 'fiscal'", async () => {
    const fastify = await buildTestServer();
    const response = await fastify.inject({ method: "GET", url: "/documentation/json" });
    expect(response.statusCode).toBe(200);

    const doc = response.json() as { paths: Record<string, unknown>; tags: { name: string }[] };
    expect(doc.tags.map((tag) => tag.name)).toContain("fiscal");

    expect(Object.keys(doc.paths)).toEqual(
      expect.arrayContaining([
        "/tax-regimes",
        "/tax-regimes/{tenantId}",
        "/tax-rules",
        "/tax-rules/{taxRuleId}",
        "/tax-rules/{taxRuleId}/deactivate",
        "/tax-calculations",
        "/fiscal-documents",
        "/fiscal-documents/{fiscalDocumentId}",
        "/fiscal-documents/by-origin/{orderId}",
        "/fiscal-documents/{fiscalDocumentId}/cancel",
        "/fiscal-obligations",
        "/fiscal-obligations/pending",
        "/fiscal-obligations/overdue",
        "/fiscal-obligations/{fiscalObligationId}/fulfill",
        "/fiscal-obligations/evaluate-overdue",
      ]),
    );
    await fastify.close();
  });

  it("nenhum path deste Hub expõe PUT/PATCH/DELETE — nenhum Command permite escrita arbitrária sobre um Aggregate já existente", async () => {
    const fastify = await buildTestServer();
    const response = await fastify.inject({ method: "GET", url: "/documentation/json" });
    const doc = response.json() as { paths: Record<string, Record<string, unknown>> };

    const fiscalDocPaths = Object.keys(doc.paths).filter(
      (path) => path.startsWith("/tax-regimes") || path.startsWith("/tax-rules") || path.startsWith("/tax-calculations") || path.startsWith("/fiscal-documents") || path.startsWith("/fiscal-obligations"),
    );
    expect(fiscalDocPaths.length).toBe(15);

    for (const path of fiscalDocPaths) {
      const methods = Object.keys(doc.paths[path]!);
      expect(methods).not.toContain("put");
      expect(methods).not.toContain("patch");
      expect(methods).not.toContain("delete");
    }
    await fastify.close();
  });
});
