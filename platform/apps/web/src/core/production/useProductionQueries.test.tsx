// @vitest-environment jsdom
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../http/client.js";
import { useActiveBillOfMaterialsForProduct } from "./useActiveBillOfMaterialsForProduct.js";
import { useActiveWorkCenters } from "./useActiveWorkCenters.js";
import { useBillOfMaterials } from "./useBillOfMaterials.js";
import { useProductionOrder } from "./useProductionOrder.js";
import { useProductionOrdersByOrigin } from "./useProductionOrdersByOrigin.js";
import { useProductionOrdersByStatus } from "./useProductionOrdersByStatus.js";
import { useTotalConsumedCost } from "./useTotalConsumedCost.js";
import { useTotalGeneratedQuantity } from "./useTotalGeneratedQuantity.js";

/**
 * Testes de Hook — `fetch` mockado, mesma divergência documentada por
 * `useInventoryMovementQueries.test.tsx`/`usePurchaseQueries.test.tsx`/`useSupplierQueries.test.tsx`
 * (conflito genuíno entre jsdom e `@abp/persistence`). A integração HTTP real e sem mock, incluindo o
 * roundtrip completo de toda Query/Command, já está integralmente coberta por
 * `productionClient.test.ts` (ambiente Node) — estes testes cobrem exclusivamente a integração com
 * React Query (queryKey, `enabled`, forma do dado) sobre a mesma implementação de `productionClient`
 * já validada ali contra o servidor real.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function wrapper({ children }: { readonly children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const bomFixture = {
  billOfMaterialsId: "bom-1",
  tenantId: "tenant-1",
  outputProductId: "bread",
  version: 1,
  lines: [{ inputProductId: "flour", quantityPerOutputUnit: 2, unitOfMeasure: "Kilogram" }],
  status: "Active",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const orderFixture = {
  productionOrderId: "po-1",
  tenantId: "tenant-1",
  billOfMaterialsId: "bom-1",
  plannedOutputQuantity: 10,
  status: "Planned",
  consumptions: [],
  outputs: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const workCenterFixture = {
  workCenterId: "wc-1",
  tenantId: "tenant-1",
  name: "Linha 1",
  active: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("useBillOfMaterials / useActiveBillOfMaterialsForProduct", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useBillOfMaterials busca uma BillOfMaterials por identificador", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(bomFixture))));

    const { result } = renderHook(() => useBillOfMaterials("bom-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.billOfMaterialsId).toBe("bom-1");
  });

  it("devolve undefined (nunca lança) quando a API responde 404", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ error: { code: "NOT_FOUND", message: "não encontrada", correlationId: "c-1" } }, 404))));

    const { result } = renderHook(() => useBillOfMaterials("does-not-exist"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it("useBillOfMaterials permanece desabilitado enquanto billOfMaterialsId é undefined", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useBillOfMaterials(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("useActiveBillOfMaterialsForProduct busca a versão Active corrente de um Produto", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse(bomFixture)));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useActiveBillOfMaterialsForProduct("bread"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/bills-of-materials/by-product/bread/active"), expect.objectContaining({ method: "GET" }));
  });
});

describe("useProductionOrder / useProductionOrdersByStatus / useProductionOrdersByOrigin", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useProductionOrder busca uma ProductionOrder por identificador", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(orderFixture))));

    const { result } = renderHook(() => useProductionOrder("po-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe("Planned");
  });

  it("useProductionOrdersByStatus busca as ProductionOrder em um status, permanece desabilitado sem status", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([orderFixture])));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useProductionOrdersByStatus("Planned"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/production-orders/by-status/Planned"), expect.objectContaining({ method: "GET" }));

    fetchMock.mockClear();
    const disabled = renderHook(() => useProductionOrdersByStatus(undefined), { wrapper });
    expect(disabled.result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("useProductionOrdersByOrigin busca as ProductionOrder originadas de um Order", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([orderFixture])));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useProductionOrdersByOrigin("order-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/production-orders/by-origin/order-1"), expect.objectContaining({ method: "GET" }));
  });
});

describe("useTotalConsumedCost / useTotalGeneratedQuantity", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useTotalConsumedCost busca a soma do acquisitionCost já consumido", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ totalConsumedCost: 40 }))));

    const { result } = renderHook(() => useTotalConsumedCost("po-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.totalConsumedCost).toBe(40);
  });

  it("useTotalConsumedCost propaga erro real (nunca undefined) quando a API responde 404", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ error: { code: "NOT_FOUND", message: "não encontrada", correlationId: "c-1" } }, 404))));

    const { result } = renderHook(() => useTotalConsumedCost("does-not-exist"), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("useTotalGeneratedQuantity busca a soma da quantidade gerada", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ totalGeneratedQuantity: 9 }))));

    const { result } = renderHook(() => useTotalGeneratedQuantity("po-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.totalGeneratedQuantity).toBe(9);
  });
});

describe("useActiveWorkCenters", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("busca os Work Center ativos, sem exigir nenhum parâmetro", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([workCenterFixture])));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useActiveWorkCenters(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/work-centers/active"), expect.objectContaining({ method: "GET" }));
  });
});
