// @vitest-environment jsdom
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../http/client.js";
import { inventoryMovementQueryKeys } from "./inventoryMovementQueryKeys.js";
import { useConvertReservationToMovement } from "./useConvertReservationToMovement.js";
import { useCreateStockAlertRule } from "./useCreateStockAlertRule.js";
import { useCreateStockLocation } from "./useCreateStockLocation.js";
import { useCreateStockReservation } from "./useCreateStockReservation.js";
import { useDeactivateStockAlertRule } from "./useDeactivateStockAlertRule.js";
import { useRegisterStockMovement } from "./useRegisterStockMovement.js";
import { useReleaseStockReservation } from "./useReleaseStockReservation.js";
import type { StockMovementResponseDto, StockPositionResponseDto, StockReservationResponseDto } from "./inventoryMovement.dto.js";

/**
 * Mutations do Inventory Movement Hub — `fetch` mockado; mesma divergência documentada (jsdom ×
 * `@abp/persistence`) já explicada em `useInventoryMovementQueries.test.tsx`. O roundtrip HTTP real de
 * cada Command está integralmente coberto, sem mock, por `inventoryMovementClient.test.ts` — estes
 * testes cobrem exclusivamente a sincronização de cache que cada Hook adiciona por cima do
 * `inventoryMovementClient` já validado.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function movement(overrides: Partial<StockMovementResponseDto> = {}): StockMovementResponseDto {
  return {
    movementId: "movement-1",
    tenantId: "tenant-1",
    productId: "product-1",
    quantityDelta: 10,
    origin: "Purchase",
    originReferenceId: "po-1",
    occurredAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function position(overrides: Partial<StockPositionResponseDto> = {}): StockPositionResponseDto {
  return {
    productId: "product-1",
    quantityOnHand: 10,
    quantityReserved: 0,
    quantityAvailable: 10,
    recalculatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function reservation(overrides: Partial<StockReservationResponseDto> = {}): StockReservationResponseDto {
  return {
    reservationId: "reservation-1",
    tenantId: "tenant-1",
    productId: "product-1",
    quantity: 4,
    orderId: "order-1",
    status: "Active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

let queryClient: QueryClient;

function wrapper({ children }: { readonly children: ReactNode }) {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("useRegisterStockMovement — cenários obrigatórios do Ledger", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("registrar movimento -> atualização automática da lista já cacheada (sempre aditiva)", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(inventoryMovementQueryKeys.movementsByProduct("product-1", undefined), [movement({ movementId: "movement-0", quantityDelta: 5 })]);
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ movement: movement(), position: position() }, 201))));

    const { result } = renderHook(() => useRegisterStockMovement(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const cachedList = queryClient.getQueryData<StockMovementResponseDto[]>(inventoryMovementQueryKeys.movementsByProduct("product-1", undefined));
    expect(cachedList).toHaveLength(2);
    expect(cachedList?.[1]).toEqual(movement());
  });

  it("consultar posição -> cache consistente com o resultado real da Mutation (sempre substituído, nunca aditivo)", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(inventoryMovementQueryKeys.position("product-1", undefined), position({ quantityOnHand: 0, quantityAvailable: 0 }));
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ movement: movement(), position: position({ quantityOnHand: 10, quantityAvailable: 10 }) }, 201))));

    const { result } = renderHook(() => useRegisterStockMovement(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData<StockPositionResponseDto>(inventoryMovementQueryKeys.position("product-1", undefined))?.quantityOnHand).toBe(10);
  });

  it("registrar movimento com originReferenceId acrescenta também à lista já cacheada por origem", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(inventoryMovementQueryKeys.movementsByOriginReference("po-1"), []);
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ movement: movement(), position: position() }, 201))));

    const { result } = renderHook(() => useRegisterStockMovement(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(inventoryMovementQueryKeys.movementsByOriginReference("po-1"))).toEqual([movement()]);
  });

  it("nunca substitui uma lista de movimentos ainda não cacheada — sem cache prévio, permanece undefined (nunca refaz a consulta ao servidor por conta própria)", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ movement: movement(), position: position() }, 201))));

    const { result } = renderHook(() => useRegisterStockMovement(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ tenantId: "tenant-1", productId: "product-1", quantityDelta: 10, origin: "Purchase", originReferenceId: "po-1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(inventoryMovementQueryKeys.movementsByProduct("product-1", undefined))).toBeUndefined();
  });
});

describe("useCreateStockReservation / useReleaseStockReservation / useConvertReservationToMovement", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useCreateStockReservation grava o cache de detalhe e acrescenta à lista por Order já cacheada", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(inventoryMovementQueryKeys.reservationsByOrder("order-1"), []);
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(reservation(), 201))));

    const { result } = renderHook(() => useCreateStockReservation(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ tenantId: "tenant-1", productId: "product-1", quantity: 4, orderId: "order-1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(inventoryMovementQueryKeys.reservation("reservation-1"))).toEqual(reservation());
    expect(queryClient.getQueryData(inventoryMovementQueryKeys.reservationsByOrder("order-1"))).toEqual([reservation()]);
  });

  it("useReleaseStockReservation substitui a entrada já cacheada (status muda, nunca duplica a linha)", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(inventoryMovementQueryKeys.reservationsByOrder("order-1"), [reservation()]);
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(reservation({ status: "Released" })))));

    const { result } = renderHook(() => useReleaseStockReservation(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate("reservation-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const list = queryClient.getQueryData<StockReservationResponseDto[]>(inventoryMovementQueryKeys.reservationsByOrder("order-1"));
    expect(list).toHaveLength(1);
    expect(list?.[0]?.status).toBe("Released");
  });

  it("useConvertReservationToMovement sincroniza Reservation, Movement (aditivo) e Position (substituído) no mesmo sucesso", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(inventoryMovementQueryKeys.movementsByProduct("product-1", undefined), []);
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          jsonResponse({
            reservation: reservation({ status: "ConvertedToMovement" }),
            movement: movement({ movementId: "movement-2", origin: "SaleFulfillment", quantityDelta: -4, originReferenceId: undefined }),
            position: position({ quantityOnHand: 6, quantityAvailable: 6 }),
          }),
        ),
      ),
    );

    const { result } = renderHook(() => useConvertReservationToMovement(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate("reservation-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData<StockReservationResponseDto>(inventoryMovementQueryKeys.reservation("reservation-1"))?.status).toBe("ConvertedToMovement");
    expect(queryClient.getQueryData<StockMovementResponseDto[]>(inventoryMovementQueryKeys.movementsByProduct("product-1", undefined))).toHaveLength(1);
    expect(queryClient.getQueryData<StockPositionResponseDto>(inventoryMovementQueryKeys.position("product-1", undefined))?.quantityOnHand).toBe(6);
  });
});

describe("useCreateStockLocation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("acrescenta a nova Location à lista de ativas já cacheada do mesmo Tenant", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(inventoryMovementQueryKeys.activeLocationsByTenant("tenant-1"), []);
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          jsonResponse({ locationId: "location-1", tenantId: "tenant-1", name: "Depósito Central", active: true, createdAt: "2026-01-01T00:00:00.000Z" }, 201),
        ),
      ),
    );

    const { result } = renderHook(() => useCreateStockLocation(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ tenantId: "tenant-1", name: "Depósito Central" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(inventoryMovementQueryKeys.activeLocationsByTenant("tenant-1"))).toHaveLength(1);
  });
});

describe("useCreateStockAlertRule / useDeactivateStockAlertRule — sem sincronização de cache", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useCreateStockAlertRule resolve com sucesso, sem nenhuma Query de detalhe/listagem para sincronizar", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          jsonResponse(
            { ruleId: "rule-1", tenantId: "tenant-1", productId: "product-1", thresholdQuantity: 5, active: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
            201,
          ),
        ),
      ),
    );

    const { result } = renderHook(() => useCreateStockAlertRule(), { wrapper });
    result.current.mutate({ tenantId: "tenant-1", productId: "product-1", thresholdQuantity: 5 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.active).toBe(true);
  });

  it("useDeactivateStockAlertRule resolve com sucesso", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          jsonResponse(
            { ruleId: "rule-1", tenantId: "tenant-1", productId: "product-1", thresholdQuantity: 5, active: false, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
          ),
        ),
      ),
    );

    const { result } = renderHook(() => useDeactivateStockAlertRule(), { wrapper });
    result.current.mutate("rule-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.active).toBe(false);
  });
});

describe("PRINCÍPIO DO LEDGER — garantia estrutural de que nenhum Hook expõe operações inexistentes", () => {
  it("o módulo de Hooks do Inventory Movement Hub nunca exporta um Hook de edição/remoção/substituição de Stock Movement", async () => {
    const registerModule = await import("./useRegisterStockMovement.js");
    const exportedNames = Object.keys(registerModule);

    expect(exportedNames).toEqual(["useRegisterStockMovement"]);
    expect(exportedNames.some((name) => /update|delete|replace|edit|remove/i.test(name))).toBe(false);
  });
});
