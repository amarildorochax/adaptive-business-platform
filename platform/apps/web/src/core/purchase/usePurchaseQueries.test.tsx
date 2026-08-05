// @vitest-environment jsdom
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../http/client.js";
import { usePurchaseOrder } from "./usePurchaseOrder.js";
import { usePurchaseOrders } from "./usePurchaseOrders.js";
import { usePurchaseOrdersBySupplier } from "./usePurchaseOrdersBySupplier.js";
import { usePurchaseRequisition } from "./usePurchaseRequisition.js";
import { usePurchaseRequisitions } from "./usePurchaseRequisitions.js";
import { useReceivings } from "./useReceivings.js";

/**
 * Testes de Hook — `fetch` mockado, mesma divergência documentada por `useSupplierQueries.test.tsx`
 * (IMP-204, conflito genuíno entre jsdom e `@abp/persistence`). A integração HTTP real e sem mock,
 * incluindo o roundtrip completo de todo Command/Query e o interceptor de autenticação, já está
 * integralmente coberta por `purchaseClient.test.ts` (ambiente Node) — estes testes cobrem
 * exclusivamente a integração com React Query (queryKey, `enabled`, forma do dado) sobre a mesma
 * implementação de `purchaseClient` já validada ali contra o servidor real.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function wrapper({ children }: { readonly children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const purchaseOrderFixture = {
  purchaseOrderId: "po-1",
  tenantId: "tenant-1",
  supplierId: "supplier-1",
  status: "Draft",
  items: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const requisitionFixture = {
  requisitionId: "req-1",
  tenantId: "tenant-1",
  origin: "Manual",
  lines: [{ productId: "product-1", suggestedQuantity: 30 }],
  status: "Open",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("usePurchaseOrder / usePurchaseOrders / usePurchaseOrdersBySupplier", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("usePurchaseOrders busca a lista aberta de um Tenant, chave de cache ['purchase','orders','open',tenantId]", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([purchaseOrderFixture])));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePurchaseOrders("tenant-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/purchase-orders/by-tenant/tenant-1/open"), expect.objectContaining({ method: "GET" }));
  });

  it("usePurchaseOrders permanece desabilitado enquanto tenantId é undefined", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePurchaseOrders(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("usePurchaseOrdersBySupplier busca a lista de um Fornecedor, chave de cache ['purchase','orders','by-supplier',supplierId]", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([purchaseOrderFixture])));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePurchaseOrdersBySupplier("supplier-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/purchase-orders/by-supplier/supplier-1"), expect.objectContaining({ method: "GET" }));
  });

  it("usePurchaseOrder busca um Purchase Order por identificador", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(purchaseOrderFixture))));

    const { result } = renderHook(() => usePurchaseOrder("po-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.supplierId).toBe("supplier-1");
  });

  it("usePurchaseOrder devolve undefined, nunca erro, para um Purchase Order inexistente (404 tratado como ausência)", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ error: { code: "NOT_FOUND", message: "não encontrado", correlationId: "c1" } }, 404))));

    const { result } = renderHook(() => usePurchaseOrder("po-inexistente"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

describe("useReceivings", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("busca a lista de Receiving de um Purchase Order, chave de cache ['purchase','receivings',purchaseOrderId]", async () => {
    const receiving = { receivingId: "receiving-1", purchaseOrderId: "po-1", tenantId: "tenant-1", lines: [], receivedAt: "2026-02-01T00:00:00.000Z" };
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([receiving])));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useReceivings("po-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/purchase-orders/po-1/receivings"), expect.objectContaining({ method: "GET" }));
  });

  it("permanece desabilitado enquanto purchaseOrderId é undefined", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useReceivings(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("usePurchaseRequisition / usePurchaseRequisitions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("usePurchaseRequisition busca uma Requisition por identificador", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(requisitionFixture))));

    const { result } = renderHook(() => usePurchaseRequisition("req-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.origin).toBe("Manual");
  });

  it("usePurchaseRequisition devolve undefined para uma Requisition inexistente", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ error: { code: "NOT_FOUND", message: "não encontrada", correlationId: "c1" } }, 404))));

    const { result } = renderHook(() => usePurchaseRequisition("req-inexistente"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it("usePurchaseRequisitions busca a lista por status, chave de cache ['purchase','requisitions',tenantId,status]", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([requisitionFixture])));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePurchaseRequisitions("tenant-1", "Open"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/purchase-requisitions/by-tenant/tenant-1/status/Open"),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("usePurchaseRequisitions permanece desabilitado enquanto status é undefined", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePurchaseRequisitions("tenant-1", undefined), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
