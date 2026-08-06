// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../http/client.js";
import { fiscalQueryKeys } from "./fiscalQueryKeys.js";
import { useCalculateTax } from "./useCalculateTax.js";
import { useCancelFiscalDocument } from "./useCancelFiscalDocument.js";
import { useCreateTaxRule } from "./useCreateTaxRule.js";
import { useDeactivateTaxRule } from "./useDeactivateTaxRule.js";
import { useEvaluateFiscalObligations } from "./useEvaluateFiscalObligations.js";
import { useFulfillFiscalObligation } from "./useFulfillFiscalObligation.js";
import { useIssueFiscalDocument } from "./useIssueFiscalDocument.js";
import { useRegisterFiscalObligation } from "./useRegisterFiscalObligation.js";
import { useRegisterTaxRegime } from "./useRegisterTaxRegime.js";
import type { FiscalDocumentResponseDto, FiscalObligationResponseDto, TaxRuleResponseDto } from "./fiscal.dto.js";

/**
 * Mutations do Fiscal Hub — `fetch` mockado; mesma divergência documentada (jsdom × `@abp/persistence`)
 * já explicada em `useFiscalQueries.test.tsx`. O roundtrip HTTP real de cada Command está integralmente
 * coberto, sem mock, por `fiscalClient.test.ts` — estes testes cobrem exclusivamente a sincronização de
 * cache (ou a ausência documentada dela) que cada Hook adiciona por cima do `fiscalClient` já validado.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function taxRule(overrides: Partial<TaxRuleResponseDto> = {}): TaxRuleResponseDto {
  return {
    taxRuleId: "rule-1",
    tenantId: "tenant-1",
    taxRegimeId: "regime-1",
    classification: { code: "1234.56.78" },
    rate: { type: "Percentage", value: 10 },
    validFrom: "2026-01-01T00:00:00.000Z",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const taxCalculationFixture = {
  taxCalculationId: "calc-1",
  fiscalDocumentLineId: "line-1",
  taxRuleId: "rule-1",
  amount: { amount: 10, currencyCode: "BRL" },
  calculatedAt: "2026-01-01T00:00:00.000Z",
};

function fiscalDocument(overrides: Partial<FiscalDocumentResponseDto> = {}): FiscalDocumentResponseDto {
  return {
    fiscalDocumentId: "doc-1",
    tenantId: "tenant-1",
    type: "Sale",
    orderId: "order-1",
    lines: [
      {
        fiscalDocumentLineId: "line-1",
        productId: "product-1",
        quantity: 2,
        unitValue: { amount: 50, currencyCode: "BRL" },
        classification: { code: "1234.56.78" },
        taxCalculation: taxCalculationFixture,
      },
    ],
    status: "Issued",
    issuedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function fiscalObligation(overrides: Partial<FiscalObligationResponseDto> = {}): FiscalObligationResponseDto {
  return {
    fiscalObligationId: "obligation-1",
    tenantId: "tenant-1",
    type: "ICMS",
    periodicity: "Monthly",
    dueDate: "2026-01-01T00:00:00.000Z",
    status: "Pending",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

let queryClient: QueryClient;

describe("useRegisterTaxRegime", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("grava o cache de detalhe do Tax Regime, chaveado por tenantId", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(jsonResponse({ taxRegimeId: "regime-1", tenantId: "tenant-1", name: "Simples Nacional", createdAt: "2026-01-01T00:00:00.000Z" }, 201))),
    );

    const { result } = renderHook(() => useRegisterTaxRegime(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ tenantId: "tenant-1", name: "Simples Nacional" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData<{ taxRegimeId: string }>(fiscalQueryKeys.taxRegimeByTenant("tenant-1"))?.taxRegimeId).toBe("regime-1");
  });
});

describe("useCreateTaxRule / useDeactivateTaxRule", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useCreateTaxRule grava o cache de detalhe da Tax Rule", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(taxRule(), 201))));

    const { result } = renderHook(() => useCreateTaxRule(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({
      tenantId: "tenant-1",
      taxRegimeId: "regime-1",
      classification: { code: "1234.56.78" },
      rate: { type: "Percentage", value: 10 },
      validFrom: "2026-01-01T00:00:00.000Z",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(fiscalQueryKeys.taxRule("rule-1"))).toEqual(taxRule());
  });

  it("useDeactivateTaxRule sincroniza o cache de detalhe com active: false — nunca exclui o registro", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(taxRule({ active: false })))));

    const { result } = renderHook(() => useDeactivateTaxRule(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate("rule-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData<TaxRuleResponseDto>(fiscalQueryKeys.taxRule("rule-1"))?.active).toBe(false);
  });
});

describe("useCalculateTax", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("nenhuma sincronização de cache — TaxCalculation não possui Query própria, apenas disponível via data", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(taxCalculationFixture, 201))));

    const { result } = renderHook(() => useCalculateTax(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({
      fiscalDocumentLineId: "line-1",
      taxRegimeId: "regime-1",
      classification: { code: "1234.56.78" },
      baseAmount: { amount: 100, currencyCode: "BRL" },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.amount).toEqual({ amount: 10, currencyCode: "BRL" });
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });
});

describe("useIssueFiscalDocument / useCancelFiscalDocument", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useIssueFiscalDocument grava o cache de detalhe, e acrescenta a fiscalDocumentsByOrigin quando orderId presente", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(fiscalQueryKeys.fiscalDocumentsByOrigin("order-1"), []);
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(fiscalDocument(), 201))));

    const { result } = renderHook(() => useIssueFiscalDocument(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ tenantId: "tenant-1", type: "Sale", orderId: "order-1", lines: [] });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(fiscalQueryKeys.fiscalDocument("doc-1"))).toEqual(fiscalDocument());
    expect(queryClient.getQueryData(fiscalQueryKeys.fiscalDocumentsByOrigin("order-1"))).toEqual([fiscalDocument()]);
  });

  it("useCancelFiscalDocument sincroniza o cache de detalhe com status Cancelled", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(fiscalDocument({ status: "Cancelled", cancelReason: "Devolução do cliente" })))));

    const { result } = renderHook(() => useCancelFiscalDocument(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ fiscalDocumentId: "doc-1", payload: { reason: "Devolução do cliente" } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData<FiscalDocumentResponseDto>(fiscalQueryKeys.fiscalDocument("doc-1"))?.status).toBe("Cancelled");
  });
});

describe("useRegisterFiscalObligation / useFulfillFiscalObligation / useEvaluateFiscalObligations", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useRegisterFiscalObligation acrescenta a nova obrigação à lista pending já cacheada", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(fiscalQueryKeys.pendingFiscalObligations(), []);
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(fiscalObligation(), 201))));

    const { result } = renderHook(() => useRegisterFiscalObligation(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ tenantId: "tenant-1", type: "ICMS", periodicity: "Monthly", dueDate: "2026-01-01T00:00:00.000Z" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(fiscalQueryKeys.pendingFiscalObligations())).toEqual([fiscalObligation()]);
  });

  it("useRegisterFiscalObligation nunca substitui uma lista pending ainda não cacheada — sem cache prévio, permanece undefined", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(fiscalObligation(), 201))));

    const { result } = renderHook(() => useRegisterFiscalObligation(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ tenantId: "tenant-1", type: "ICMS", periodicity: "Monthly", dueDate: "2026-01-01T00:00:00.000Z" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(fiscalQueryKeys.pendingFiscalObligations())).toBeUndefined();
  });

  it("useFulfillFiscalObligation nunca sincroniza pending/overdue — limitação documentada", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(fiscalQueryKeys.pendingFiscalObligations(), [fiscalObligation()]);
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(fiscalObligation({ status: "Fulfilled", fulfilledAt: "2026-01-02T00:00:00.000Z" })))));

    const { result } = renderHook(() => useFulfillFiscalObligation(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate("obligation-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe("Fulfilled");
    expect(queryClient.getQueryData(fiscalQueryKeys.pendingFiscalObligations())).toEqual([fiscalObligation()]);
  });

  it("useEvaluateFiscalObligations nunca sincroniza pending/overdue — limitação documentada; data.overdue disponível ao chamador", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(fiscalQueryKeys.pendingFiscalObligations(), [fiscalObligation()]);
    queryClient.setQueryData(fiscalQueryKeys.overdueFiscalObligations(), []);
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ overdue: [fiscalObligation({ status: "Overdue" })] }))));

    const { result } = renderHook(() => useEvaluateFiscalObligations(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.overdue).toEqual([fiscalObligation({ status: "Overdue" })]);
    expect(queryClient.getQueryData(fiscalQueryKeys.pendingFiscalObligations())).toEqual([fiscalObligation()]);
    expect(queryClient.getQueryData(fiscalQueryKeys.overdueFiscalObligations())).toEqual([]);
  });
});
