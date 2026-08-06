// @vitest-environment jsdom
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../http/client.js";
import { useFiscalDocument } from "./useFiscalDocument.js";
import { useFiscalDocumentsByOrigin } from "./useFiscalDocumentsByOrigin.js";
import { useOverdueFiscalObligations } from "./useOverdueFiscalObligations.js";
import { usePendingFiscalObligations } from "./usePendingFiscalObligations.js";
import { useTaxRegime } from "./useTaxRegime.js";
import { useTaxRule } from "./useTaxRule.js";

/**
 * Testes de Hook — `fetch` mockado, mesma divergência documentada por
 * `useProductionQueries.test.tsx`/`useInventoryMovementQueries.test.tsx`/`usePurchaseQueries.test.tsx`/
 * `useSupplierQueries.test.tsx` (conflito genuíno entre jsdom e `@abp/persistence`). A integração HTTP
 * real e sem mock, incluindo o roundtrip completo de toda Query/Command, já está integralmente coberta
 * por `fiscalClient.test.ts` (ambiente Node) — estes testes cobrem exclusivamente a integração com
 * React Query (queryKey, `enabled`, forma do dado) sobre a mesma implementação de `fiscalClient` já
 * validada ali contra o servidor real.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function wrapper({ children }: { readonly children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const taxRegimeFixture = {
  taxRegimeId: "regime-1",
  tenantId: "tenant-1",
  name: "Simples Nacional",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const taxRuleFixture = {
  taxRuleId: "rule-1",
  tenantId: "tenant-1",
  taxRegimeId: "regime-1",
  classification: { code: "1234.56.78" },
  rate: { type: "Percentage", value: 10 },
  validFrom: "2026-01-01T00:00:00.000Z",
  active: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const taxCalculationFixture = {
  taxCalculationId: "calc-1",
  fiscalDocumentLineId: "line-1",
  taxRuleId: "rule-1",
  amount: { amount: 10, currencyCode: "BRL" },
  calculatedAt: "2026-01-01T00:00:00.000Z",
};

const fiscalDocumentFixture = {
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
};

const fiscalObligationFixture = {
  fiscalObligationId: "obligation-1",
  tenantId: "tenant-1",
  type: "ICMS",
  periodicity: "Monthly",
  dueDate: "2026-01-01T00:00:00.000Z",
  status: "Pending",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("useTaxRegime", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("busca o Tax Regime de um Tenant", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(taxRegimeFixture))));

    const { result } = renderHook(() => useTaxRegime("tenant-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.taxRegimeId).toBe("regime-1");
  });

  it("devolve undefined (nunca lança) quando a API responde 404", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ error: { code: "NOT_FOUND", message: "não encontrado", correlationId: "c-1" } }, 404))));

    const { result } = renderHook(() => useTaxRegime("does-not-exist"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it("permanece desabilitado enquanto tenantId é undefined", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useTaxRegime(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("useTaxRule", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("busca uma Tax Rule por identificador", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse(taxRuleFixture)));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useTaxRule("rule-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/tax-rules/rule-1"), expect.objectContaining({ method: "GET" }));
    expect(result.current.data?.active).toBe(true);
  });

  it("devolve undefined (nunca lança) quando a API responde 404", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ error: { code: "NOT_FOUND", message: "não encontrada", correlationId: "c-1" } }, 404))));

    const { result } = renderHook(() => useTaxRule("does-not-exist"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

describe("useFiscalDocument / useFiscalDocumentsByOrigin", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useFiscalDocument busca um Fiscal Document por identificador", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(fiscalDocumentFixture))));

    const { result } = renderHook(() => useFiscalDocument("doc-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe("Issued");
  });

  it("useFiscalDocumentsByOrigin busca os Fiscal Document originados de um Order, permanece desabilitado sem orderId", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([fiscalDocumentFixture])));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useFiscalDocumentsByOrigin("order-1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/fiscal-documents/by-origin/order-1"), expect.objectContaining({ method: "GET" }));

    fetchMock.mockClear();
    const disabled = renderHook(() => useFiscalDocumentsByOrigin(undefined), { wrapper });
    expect(disabled.result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("usePendingFiscalObligations / useOverdueFiscalObligations", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("usePendingFiscalObligations busca as obrigações pendentes, sem exigir nenhum parâmetro", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([fiscalObligationFixture])));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePendingFiscalObligations(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/fiscal-obligations/pending"), expect.objectContaining({ method: "GET" }));
  });

  it("useOverdueFiscalObligations busca as obrigações vencidas, sem exigir nenhum parâmetro", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([{ ...fiscalObligationFixture, status: "Overdue" }])));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useOverdueFiscalObligations(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/fiscal-obligations/overdue"), expect.objectContaining({ method: "GET" }));
  });
});
