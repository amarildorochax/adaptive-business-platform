// @vitest-environment jsdom
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../http/client.js";
import { supplierQueryKeys } from "./supplierQueryKeys.js";
import { useAddSupplierContact } from "./useAddSupplierContact.js";
import { useCreateSupplier } from "./useCreateSupplier.js";
import { useCreateSupplierContract } from "./useCreateSupplierContract.js";
import { useDisableSupplier } from "./useDisableSupplier.js";
import { useReactivateSupplier } from "./useReactivateSupplier.js";
import { useRecordSupplierPerformance } from "./useRecordSupplierPerformance.js";
import { useRegisterSupplierCatalogItem } from "./useRegisterSupplierCatalogItem.js";
import { useUpdateSupplier } from "./useUpdateSupplier.js";
import { useUpdateSupplierCatalogItem } from "./useUpdateSupplierCatalogItem.js";
import type { SupplierResponseDto } from "./supplier.dto.js";

/**
 * Mutations do Supplier Hub — `fetch` mockado; a mesma divergência documentada (jsdom ×
 * `@abp/persistence`) já explicada em `useSupplierQueries.test.tsx`, cabeçalho do arquivo. O
 * roundtrip HTTP real de cada Command está integralmente coberto, sem mock, por
 * `supplierClient.test.ts` — estes testes cobrem exclusivamente a sincronização de cache que cada
 * hook adiciona por cima do `supplierClient` já validado.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function supplier(overrides: Partial<SupplierResponseDto> = {}): SupplierResponseDto {
  return {
    supplierId: "s1",
    tenantId: "tenant-1",
    legalName: "Floricultura Atacado Ltda.",
    taxId: "12345678000199",
    status: "Active",
    contacts: [],
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

describe("Mutations do Supplier Hub — sincronização de cache", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useCreateSupplier grava o cache de detalhe e acrescenta à lista já em cache do mesmo Tenant", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(supplierQueryKeys.list("tenant-1"), []);
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(supplier(), 201))));

    const { result } = renderHook(() => useCreateSupplier(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ tenantId: "tenant-1", legalName: "Floricultura Atacado Ltda.", taxId: "12345678000199" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(supplierQueryKeys.detail("s1"))).toEqual(supplier());
    expect(queryClient.getQueryData<readonly SupplierResponseDto[]>(supplierQueryKeys.list("tenant-1"))).toEqual([supplier()]);
  });

  it("useUpdateSupplier substitui a entrada correspondente em cache, nunca duplica", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(supplierQueryKeys.list("tenant-1"), [supplier()]);
    const updated = supplier({ legalName: "Nome Novo" });
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(updated))));

    const { result } = renderHook(() => useUpdateSupplier(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ supplierId: "s1", payload: { legalName: "Nome Novo" } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData<readonly SupplierResponseDto[]>(supplierQueryKeys.list("tenant-1"))).toEqual([updated]);
  });

  it("useDisableSupplier sincroniza o cache de detalhe com o novo status", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(supplier({ status: "Disabled" })))));

    const { result } = renderHook(() => useDisableSupplier(), { wrapper });
    result.current.mutate("s1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((queryClient.getQueryData(supplierQueryKeys.detail("s1")) as SupplierResponseDto).status).toBe("Disabled");
  });

  it("useReactivateSupplier sincroniza o cache de detalhe com o novo status", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(supplier({ status: "Active" })))));

    const { result } = renderHook(() => useReactivateSupplier(), { wrapper });
    result.current.mutate("s1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((queryClient.getQueryData(supplierQueryKeys.detail("s1")) as SupplierResponseDto).status).toBe("Active");
  });

  it("useAddSupplierContact sincroniza o cache de detalhe com o Contact novo", async () => {
    const withContact = supplier({ contacts: [{ contactId: "c1", supplierId: "s1", name: "Maria Souza", role: "Commercial" }] });
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(withContact, 201))));

    const { result } = renderHook(() => useAddSupplierContact(), { wrapper });
    result.current.mutate({ supplierId: "s1", payload: { name: "Maria Souza", role: "Commercial" } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((queryClient.getQueryData(supplierQueryKeys.detail("s1")) as SupplierResponseDto).contacts).toHaveLength(1);
  });

  it("useRegisterSupplierCatalogItem não sincroniza nenhum cache (nenhuma Query de listagem existe) — apenas devolve o dado da Mutation", async () => {
    const item = { catalogItemId: "item-1", supplierId: "s1", tenantId: "tenant-1", productId: "product-1", listPrice: { amount: 19.9, currencyCode: "BRL" }, leadTimeInDays: 5, minimumOrderQuantity: 10, createdAt: "2026-01-01T00:00:00.000Z" };
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(item, 201))));

    const { result } = renderHook(() => useRegisterSupplierCatalogItem(), { wrapper });
    result.current.mutate({ supplierId: "s1", tenantId: "tenant-1", productId: "product-1", listPrice: { amount: 19.9, currencyCode: "BRL" }, leadTimeInDays: 5, minimumOrderQuantity: 10 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(item);
  });

  it("useUpdateSupplierCatalogItem devolve o item atualizado, sem cache associado", async () => {
    const item = { catalogItemId: "item-1", supplierId: "s1", tenantId: "tenant-1", productId: "product-1", listPrice: { amount: 21.5, currencyCode: "BRL" }, leadTimeInDays: 5, minimumOrderQuantity: 10, createdAt: "2026-01-01T00:00:00.000Z" };
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(item))));

    const { result } = renderHook(() => useUpdateSupplierCatalogItem(), { wrapper });
    result.current.mutate({ catalogItemId: "item-1", payload: { listPrice: { amount: 21.5, currencyCode: "BRL" } } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.listPrice.amount).toBe(21.5);
  });

  it("useCreateSupplierContract devolve o contrato criado, sem cache associado", async () => {
    const contract = { contractId: "contract-1", supplierId: "s1", tenantId: "tenant-1", startsAt: "2026-01-01T00:00:00.000Z", paymentTermsDueInDays: 30, createdAt: "2026-01-01T00:00:00.000Z" };
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(contract, 201))));

    const { result } = renderHook(() => useCreateSupplierContract(), { wrapper });
    result.current.mutate({ supplierId: "s1", tenantId: "tenant-1", startsAt: "2026-01-01T00:00:00.000Z", paymentTermsDueInDays: 30 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.paymentTermsDueInDays).toBe(30);
  });

  it("useRecordSupplierPerformance devolve o(s) registro(s) criado(s), sem cache associado", async () => {
    const records = [{ recordId: "r1", supplierId: "s1", tenantId: "tenant-1", purchaseOrderId: "po-1", observationType: "OnTimeDelivery", observedAt: "2026-01-09T00:00:00.000Z" }];
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(records, 201))));

    const { result } = renderHook(() => useRecordSupplierPerformance(), { wrapper });
    result.current.mutate({ supplierId: "s1", tenantId: "tenant-1", purchaseOrderId: "po-1", promisedAt: "2026-01-10T00:00:00.000Z", receivedAt: "2026-01-09T00:00:00.000Z", quantityOrdered: 100, quantityReceived: 100 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(records);
  });

  it("useCreateSupplier propaga um ApiError real do corpo padronizado (409), tratável por onError do chamador", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ error: { code: "CONFLICT", message: "Já existe um Supplier com este identificador fiscal.", correlationId: "c1" } }, 409))));

    const { result } = renderHook(() => useCreateSupplier(), { wrapper });
    result.current.mutate({ tenantId: "tenant-1", legalName: "Duplicado", taxId: "12345678000199" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as { statusCode?: number })?.statusCode).toBe(409);
  });
});
