// @vitest-environment jsdom
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../http/client.js";
import { useActiveStockLocations } from "./useActiveStockLocations.js";
import { useStockMovementsByOriginReference } from "./useStockMovementsByOriginReference.js";
import { useStockMovementsByProduct } from "./useStockMovementsByProduct.js";
import { useStockPosition } from "./useStockPosition.js";
import { useStockReservation } from "./useStockReservation.js";
import { useStockReservationsByOrder } from "./useStockReservationsByOrder.js";

/**
 * Testes de Hook — `fetch` mockado, mesma divergência documentada por `usePurchaseQueries.test.tsx`/
 * `useSupplierQueries.test.tsx` (conflito genuíno entre jsdom e `@abp/persistence`). A integração HTTP
 * real e sem mock, incluindo o roundtrip completo de toda Query/Command, já está integralmente coberta
 * por `inventoryMovementClient.test.ts` (ambiente Node) — estes testes cobrem exclusivamente a
 * integração com React Query (queryKey, `enabled`, forma do dado) sobre a mesma implementação de
 * `inventoryMovementClient` já validada ali contra o servidor real.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function wrapper({ children }: { readonly children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const movementFixture = {
  movementId: "movement-1",
  tenantId: "tenant-1",
  productId: "product-1",
  quantityDelta: 10,
  origin: "Purchase",
  originReferenceId: "po-1",
  occurredAt: "2026-01-01T00:00:00.000Z",
};

const positionFixture = {
  productId: "product-1",
  quantityOnHand: 10,
  quantityReserved: 0,
  quantityAvailable: 10,
  recalculatedAt: "2026-01-01T00:00:00.000Z",
};

const reservationFixture = {
  reservationId: "reservation-1",
  tenantId: "tenant-1",
  productId: "product-1",
  quantity: 4,
  orderId: "order-1",
  status: "Active",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const locationFixture = {
  locationId: "location-1",
  tenantId: "tenant-1",
  name: "Depósito Central",
  active: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("useStockMovementsByProduct / useStockMovementsByOriginReference", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useStockMovementsByProduct busca o histórico de um Produto, chave de cache ['inventory-movement','movements','by-product',productId,null]", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([movementFixture])));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useStockMovementsByProduct("product-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/stock-movements/by-product/product-1"), expect.objectContaining({ method: "GET" }));
  });

  it("useStockMovementsByProduct anexa ?locationId= quando informado", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([movementFixture])));
    vi.stubGlobal("fetch", fetchMock);

    renderHook(() => useStockMovementsByProduct("product-1", "location-a"), { wrapper });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/stock-movements/by-product/product-1?locationId=location-a"),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("useStockMovementsByProduct permanece desabilitado enquanto productId é undefined", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useStockMovementsByProduct(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("useStockMovementsByOriginReference busca as movimentações de um Purchase Order de origem", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([movementFixture])));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useStockMovementsByOriginReference("po-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/stock-movements/by-origin-reference/po-1"), expect.objectContaining({ method: "GET" }));
  });
});

describe("useStockPosition", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("busca a Stock Position já recalculada de um Produto", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(positionFixture))));

    const { result } = renderHook(() => useStockPosition("product-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.quantityOnHand).toBe(10);
  });

  it("devolve undefined (nunca lança) quando a API responde 404 — Produto ainda sem Position recalculada", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ error: { code: "NOT_FOUND", message: "não encontrada", correlationId: "c-1" } }, 404))));

    const { result } = renderHook(() => useStockPosition("product-nunca-movimentado"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

describe("useStockReservation / useStockReservationsByOrder", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useStockReservation busca uma Reservation por identificador", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(reservationFixture))));

    const { result } = renderHook(() => useStockReservation("reservation-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe("Active");
  });

  it("useStockReservationsByOrder busca as Reservation de um Order", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([reservationFixture])));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useStockReservationsByOrder("order-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/stock-reservations/by-order/order-1"), expect.objectContaining({ method: "GET" }));
  });
});

describe("useActiveStockLocations", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("busca as Stock Location ativas de um Tenant", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([locationFixture])));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useActiveStockLocations("tenant-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/stock-locations/by-tenant/tenant-1/active"), expect.objectContaining({ method: "GET" }));
  });

  it("permanece desabilitado enquanto tenantId é undefined", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useActiveStockLocations(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
