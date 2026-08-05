// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../http/client.js";
import { productionQueryKeys } from "./productionQueryKeys.js";
import { useCancelProduction } from "./useCancelProduction.js";
import { useCompleteProduction } from "./useCompleteProduction.js";
import { useCreateBillOfMaterials } from "./useCreateBillOfMaterials.js";
import { useCreateProductionOrder } from "./useCreateProductionOrder.js";
import { useCreateWorkCenter } from "./useCreateWorkCenter.js";
import { useRegisterProductionConsumption } from "./useRegisterProductionConsumption.js";
import { useRegisterProductionOutput } from "./useRegisterProductionOutput.js";
import { useStartProduction } from "./useStartProduction.js";
import { useSupersedeBillOfMaterials } from "./useSupersedeBillOfMaterials.js";
import type { BillOfMaterialsResponseDto, ProductionOrderResponseDto } from "./production.dto.js";

/**
 * Mutations do Production Hub — `fetch` mockado; mesma divergência documentada (jsdom ×
 * `@abp/persistence`) já explicada em `useProductionQueries.test.tsx`. O roundtrip HTTP real de cada
 * Command está integralmente coberto, sem mock, por `productionClient.test.ts` — estes testes cobrem
 * exclusivamente a sincronização de cache que cada Hook adiciona por cima do `productionClient` já
 * validado.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function bom(overrides: Partial<BillOfMaterialsResponseDto> = {}): BillOfMaterialsResponseDto {
  return {
    billOfMaterialsId: "bom-1",
    tenantId: "tenant-1",
    outputProductId: "bread",
    version: 1,
    lines: [{ inputProductId: "flour", quantityPerOutputUnit: 2, unitOfMeasure: "Kilogram" }],
    status: "Active",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function order(overrides: Partial<ProductionOrderResponseDto> = {}): ProductionOrderResponseDto {
  return {
    productionOrderId: "po-1",
    tenantId: "tenant-1",
    billOfMaterialsId: "bom-1",
    plannedOutputQuantity: 10,
    status: "Planned",
    consumptions: [],
    outputs: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

let queryClient: QueryClient;

describe("useCreateBillOfMaterials / useSupersedeBillOfMaterials", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useCreateBillOfMaterials grava o cache de detalhe e o de 'ativa por produto'", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(bom(), 201))));

    const { result } = renderHook(() => useCreateBillOfMaterials(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ tenantId: "tenant-1", outputProductId: "bread", lines: [] });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(productionQueryKeys.billOfMaterials("bom-1"))).toEqual(bom());
    expect(queryClient.getQueryData(productionQueryKeys.activeBillOfMaterialsByProduct("bread"))).toEqual(bom());
  });

  it("useSupersedeBillOfMaterials sincroniza previous (Superseded) e next (Active) — apenas next atualiza 'ativa por produto'", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          jsonResponse({
            previous: bom({ status: "Superseded", supersededAt: "2026-01-02T00:00:00.000Z" }),
            next: bom({ billOfMaterialsId: "bom-2", version: 2 }),
          }),
        ),
      ),
    );

    const { result } = renderHook(() => useSupersedeBillOfMaterials(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ billOfMaterialsId: "bom-1", payload: { lines: [] } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData<BillOfMaterialsResponseDto>(productionQueryKeys.billOfMaterials("bom-1"))?.status).toBe("Superseded");
    expect(queryClient.getQueryData<BillOfMaterialsResponseDto>(productionQueryKeys.billOfMaterials("bom-2"))?.status).toBe("Active");
    expect(queryClient.getQueryData<BillOfMaterialsResponseDto>(productionQueryKeys.activeBillOfMaterialsByProduct("bread"))?.billOfMaterialsId).toBe("bom-2");
  });
});

describe("useCreateProductionOrder / useStartProduction / useCompleteProduction / useCancelProduction", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useCreateProductionOrder grava o cache de detalhe, e acrescenta a productionOrdersByOrigin quando orderId presente", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(productionQueryKeys.productionOrdersByOrigin("order-1"), []);
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(order({ orderId: "order-1" }), 201))));

    const { result } = renderHook(() => useCreateProductionOrder(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ tenantId: "tenant-1", billOfMaterialsId: "bom-1", plannedOutputQuantity: 10, orderId: "order-1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(productionQueryKeys.productionOrder("po-1"))).toEqual(order({ orderId: "order-1" }));
    expect(queryClient.getQueryData(productionQueryKeys.productionOrdersByOrigin("order-1"))).toEqual([order({ orderId: "order-1" })]);
  });

  it("useCreateProductionOrder nunca sincroniza productionOrdersByStatus — limitação documentada", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(productionQueryKeys.productionOrdersByStatus("Planned"), []);
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(order(), 201))));

    const { result } = renderHook(() => useCreateProductionOrder(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ tenantId: "tenant-1", billOfMaterialsId: "bom-1", plannedOutputQuantity: 10 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(productionQueryKeys.productionOrdersByStatus("Planned"))).toEqual([]);
  });

  it("useStartProduction sincroniza a productionOrder embutida no resultado composto", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ productionOrder: order({ status: "InProgress" }), started: true }))));

    const { result } = renderHook(() => useStartProduction(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ productionOrderId: "po-1", payload: { availableQuantities: { flour: 20 } } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.started).toBe(true);
    expect(queryClient.getQueryData<ProductionOrderResponseDto>(productionQueryKeys.productionOrder("po-1"))?.status).toBe("InProgress");
  });

  it("useCompleteProduction e useCancelProduction sincronizam o cache de detalhe", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(order({ status: "Completed" })))));

    const complete = renderHook(() => useCompleteProduction(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    complete.result.current.mutate("po-1");
    await waitFor(() => expect(complete.result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData<ProductionOrderResponseDto>(productionQueryKeys.productionOrder("po-1"))?.status).toBe("Completed");

    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(order({ status: "Cancelled", cancelReason: "Cliente desistiu" })))));
    const cancel = renderHook(() => useCancelProduction(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    cancel.result.current.mutate({ productionOrderId: "po-1", payload: { reason: "Cliente desistiu" } });
    await waitFor(() => expect(cancel.result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData<ProductionOrderResponseDto>(productionQueryKeys.productionOrder("po-1"))?.cancelReason).toBe("Cliente desistiu");
  });
});

describe("useRegisterProductionConsumption / useRegisterProductionOutput", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useRegisterProductionConsumption sincroniza a productionOrder já com o novo consumo embutido — nenhuma sincronização própria para ProductionConsumption", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const consumption = { consumptionId: "consumption-1", productionOrderId: "po-1", inputProductId: "flour", quantityConsumed: 20, acquisitionCost: 40, consumedAt: "2026-01-01T00:00:00.000Z" };
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(jsonResponse({ productionOrder: order({ status: "InProgress", consumptions: [consumption] }), consumption }, 201)),
      ),
    );

    const { result } = renderHook(() => useRegisterProductionConsumption(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ productionOrderId: "po-1", payload: { inputProductId: "flour", quantityConsumed: 20, acquisitionCost: 40 } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData<ProductionOrderResponseDto>(productionQueryKeys.productionOrder("po-1"))?.consumptions).toEqual([consumption]);
  });

  it("useRegisterProductionOutput sincroniza a productionOrder já com a nova geração embutida", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const output = { outputId: "output-1", productionOrderId: "po-1", outputProductId: "bread", quantityGenerated: 9, generatedAt: "2026-01-01T00:00:00.000Z" };
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(jsonResponse({ productionOrder: order({ status: "InProgress", outputs: [output] }), output }, 201))),
    );

    const { result } = renderHook(() => useRegisterProductionOutput(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ productionOrderId: "po-1", payload: { outputProductId: "bread", quantityGenerated: 9 } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData<ProductionOrderResponseDto>(productionQueryKeys.productionOrder("po-1"))?.outputs).toEqual([output]);
  });
});

describe("useCreateWorkCenter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("acrescenta o novo Work Center à lista de ativos já cacheada", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(productionQueryKeys.activeWorkCenters(), []);
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(jsonResponse({ workCenterId: "wc-1", tenantId: "tenant-1", name: "Linha 1", active: true, createdAt: "2026-01-01T00:00:00.000Z" }, 201))),
    );

    const { result } = renderHook(() => useCreateWorkCenter(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ tenantId: "tenant-1", name: "Linha 1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(productionQueryKeys.activeWorkCenters())).toHaveLength(1);
  });

  it("nunca substitui uma lista de Work Center ainda não cacheada — sem cache prévio, permanece undefined", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(jsonResponse({ workCenterId: "wc-1", tenantId: "tenant-1", name: "Linha 1", active: true, createdAt: "2026-01-01T00:00:00.000Z" }, 201))),
    );

    const { result } = renderHook(() => useCreateWorkCenter(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ tenantId: "tenant-1", name: "Linha 1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(productionQueryKeys.activeWorkCenters())).toBeUndefined();
  });
});
