// @vitest-environment jsdom
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../http/client.js";
import { purchaseQueryKeys } from "./purchaseQueryKeys.js";
import { useAddPurchaseOrderItem } from "./useAddPurchaseOrderItem.js";
import { useApprovePurchaseOrder } from "./useApprovePurchaseOrder.js";
import { useApprovePurchaseRequisition } from "./useApprovePurchaseRequisition.js";
import { useCancelPurchaseOrder } from "./useCancelPurchaseOrder.js";
import { useConvertRequisitionToPurchaseOrder } from "./useConvertRequisitionToPurchaseOrder.js";
import { useCreatePurchaseOrder } from "./useCreatePurchaseOrder.js";
import { useCreatePurchaseRequisition } from "./useCreatePurchaseRequisition.js";
import { useCreateReorderRule } from "./useCreateReorderRule.js";
import { useDeactivateReorderRule } from "./useDeactivateReorderRule.js";
import { useEvaluateReorderRule } from "./useEvaluateReorderRule.js";
import { useRegisterReceiving } from "./useRegisterReceiving.js";
import { useRejectPurchaseRequisition } from "./useRejectPurchaseRequisition.js";
import { useSendPurchaseOrderToSupplier } from "./useSendPurchaseOrderToSupplier.js";
import type { PurchaseOrderResponseDto, PurchaseRequisitionResponseDto } from "./purchase.dto.js";

/**
 * Mutations do Purchase Hub — `fetch` mockado; mesma divergência documentada (jsdom ×
 * `@abp/persistence`) já explicada em `usePurchaseQueries.test.tsx`. O roundtrip HTTP real de cada
 * Command está integralmente coberto, sem mock, por `purchaseClient.test.ts` — estes testes cobrem
 * exclusivamente a sincronização de cache que cada Hook adiciona por cima do `purchaseClient` já
 * validado.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function purchaseOrder(overrides: Partial<PurchaseOrderResponseDto> = {}): PurchaseOrderResponseDto {
  return {
    purchaseOrderId: "po-1",
    tenantId: "tenant-1",
    supplierId: "supplier-1",
    status: "Draft",
    items: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function requisition(overrides: Partial<PurchaseRequisitionResponseDto> = {}): PurchaseRequisitionResponseDto {
  return {
    requisitionId: "req-1",
    tenantId: "tenant-1",
    origin: "Manual",
    lines: [{ productId: "product-1", suggestedQuantity: 30 }],
    status: "Open",
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

describe("Mutations de Purchase Order — sincronização de cache", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useCreatePurchaseOrder grava o cache de detalhe e acrescenta às listas já em cache do mesmo Tenant/Fornecedor", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(purchaseQueryKeys.openOrdersByTenant("tenant-1"), []);
    queryClient.setQueryData(purchaseQueryKeys.ordersBySupplier("supplier-1"), []);
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(purchaseOrder(), 201))));

    const { result } = renderHook(() => useCreatePurchaseOrder(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ tenantId: "tenant-1", supplierId: "supplier-1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(purchaseQueryKeys.order("po-1"))).toEqual(purchaseOrder());
    expect(queryClient.getQueryData(purchaseQueryKeys.openOrdersByTenant("tenant-1"))).toEqual([purchaseOrder()]);
    expect(queryClient.getQueryData(purchaseQueryKeys.ordersBySupplier("supplier-1"))).toEqual([purchaseOrder()]);
  });

  it("useAddPurchaseOrderItem sincroniza o cache de detalhe com o item novo", async () => {
    const withItem = purchaseOrder({
      status: "PendingApproval",
      items: [{ purchaseOrderItemId: "item-1", purchaseOrderId: "po-1", productId: "product-1", quantityOrdered: 10, quantityReceived: 0, acquisitionCost: { amount: 10, currencyCode: "BRL" }, status: "Pending" }],
    });
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(withItem, 201))));

    const { result } = renderHook(() => useAddPurchaseOrderItem(), { wrapper });
    result.current.mutate({ purchaseOrderId: "po-1", payload: { productId: "product-1", quantityOrdered: 10, acquisitionCost: { amount: 10, currencyCode: "BRL" } } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((queryClient.getQueryData(purchaseQueryKeys.order("po-1")) as PurchaseOrderResponseDto).items).toHaveLength(1);
  });

  it("useApprovePurchaseOrder sincroniza o cache de detalhe com o novo status", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(purchaseOrder({ status: "Approved" })))));

    const { result } = renderHook(() => useApprovePurchaseOrder(), { wrapper });
    result.current.mutate({ purchaseOrderId: "po-1", payload: { threshold: { amount: 1000, currencyCode: "BRL" } } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((queryClient.getQueryData(purchaseQueryKeys.order("po-1")) as PurchaseOrderResponseDto).status).toBe("Approved");
  });

  it("useSendPurchaseOrderToSupplier sincroniza o cache de detalhe com o novo status", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(purchaseOrder({ status: "Sent" })))));

    const { result } = renderHook(() => useSendPurchaseOrderToSupplier(), { wrapper });
    result.current.mutate("po-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((queryClient.getQueryData(purchaseQueryKeys.order("po-1")) as PurchaseOrderResponseDto).status).toBe("Sent");
  });

  it("useCancelPurchaseOrder sincroniza o cache de detalhe com o novo status", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(purchaseOrder({ status: "Cancelled" })))));

    const { result } = renderHook(() => useCancelPurchaseOrder(), { wrapper });
    result.current.mutate("po-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((queryClient.getQueryData(purchaseQueryKeys.order("po-1")) as PurchaseOrderResponseDto).status).toBe("Cancelled");
  });

  it("useRegisterReceiving sincroniza o Purchase Order embutido e acrescenta à lista de Receivings já em cache", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(purchaseQueryKeys.receivings("po-1"), []);
    const registration = {
      receiving: { receivingId: "receiving-1", purchaseOrderId: "po-1", tenantId: "tenant-1", lines: [{ purchaseOrderItemId: "item-1", quantityReceived: 10 }], receivedAt: "2026-02-01T00:00:00.000Z" },
      purchaseOrder: purchaseOrder({ status: "Received" }),
      fullyReceived: true,
    };
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(registration, 201))));

    const { result } = renderHook(() => useRegisterReceiving(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate({ purchaseOrderId: "po-1", tenantId: "tenant-1", lines: [{ purchaseOrderItemId: "item-1", quantityReceived: 10 }], receivedAt: "2026-02-01T00:00:00.000Z" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((queryClient.getQueryData(purchaseQueryKeys.order("po-1")) as PurchaseOrderResponseDto).status).toBe("Received");
    expect(queryClient.getQueryData(purchaseQueryKeys.receivings("po-1"))).toHaveLength(1);
  });

  it("useRegisterReceiving propaga um ApiError 500 real quando o servidor rejeita (limitação conhecida, IMP-303) — nenhum workaround, o erro chega intacto ao chamador", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ error: { code: "INTERNAL_SERVER_ERROR", message: "Erro interno do servidor.", correlationId: "c1" } }, 500))));

    const { result } = renderHook(() => useRegisterReceiving(), { wrapper });
    result.current.mutate({ purchaseOrderId: "po-1", tenantId: "tenant-1", lines: [{ purchaseOrderItemId: "item-1", quantityReceived: 6 }], receivedAt: "2026-02-02T00:00:00.000Z" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as { statusCode?: number })?.statusCode).toBe(500);
  });
});

describe("Mutations de Purchase Requisition — sincronização de cache", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useCreatePurchaseRequisition grava o cache de detalhe", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(requisition(), 201))));

    const { result } = renderHook(() => useCreatePurchaseRequisition(), { wrapper });
    result.current.mutate({ tenantId: "tenant-1", origin: "Manual", lines: [{ productId: "product-1", suggestedQuantity: 30 }] });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(purchaseQueryKeys.requisition("req-1"))).toEqual(requisition());
  });

  it("useApprovePurchaseRequisition sincroniza o cache de detalhe, nunca a lista por status (limitação documentada)", async () => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(purchaseQueryKeys.requisitionsByStatus("tenant-1", "Open"), [requisition()]);
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(requisition({ status: "Approved" })))));

    const { result } = renderHook(() => useApprovePurchaseRequisition(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    result.current.mutate("req-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((queryClient.getQueryData(purchaseQueryKeys.requisition("req-1")) as PurchaseRequisitionResponseDto).status).toBe("Approved");
    // A lista da chave antiga (`status: "Open"`) permanece desatualizada em cache — limitação
    // documentada em `purchaseCache.ts`/`IMP_304_PURCHASE_FRONTEND_REPORT.md`, nunca corrigida
    // silenciosamente aqui.
    expect(queryClient.getQueryData(purchaseQueryKeys.requisitionsByStatus("tenant-1", "Open"))).toEqual([requisition()]);
  });

  it("useRejectPurchaseRequisition sincroniza o cache de detalhe com o novo status", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(requisition({ status: "Rejected" })))));

    const { result } = renderHook(() => useRejectPurchaseRequisition(), { wrapper });
    result.current.mutate("req-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((queryClient.getQueryData(purchaseQueryKeys.requisition("req-1")) as PurchaseRequisitionResponseDto).status).toBe("Rejected");
  });

  it("useConvertRequisitionToPurchaseOrder sincroniza ambas as Entidades do resultado composto", async () => {
    const conversion = {
      requisition: requisition({ status: "ConvertedToPurchaseOrder", purchaseOrderId: "po-1" }),
      purchaseOrder: purchaseOrder({ requisitionId: "req-1", status: "PendingApproval" }),
    };
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(conversion, 201))));

    const { result } = renderHook(() => useConvertRequisitionToPurchaseOrder(), { wrapper });
    result.current.mutate({ requisitionId: "req-1", payload: { supplierId: "supplier-1", acquisitionCosts: [{ productId: "product-1", cost: { amount: 20, currencyCode: "BRL" } }] } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((queryClient.getQueryData(purchaseQueryKeys.requisition("req-1")) as PurchaseRequisitionResponseDto).status).toBe("ConvertedToPurchaseOrder");
    expect((queryClient.getQueryData(purchaseQueryKeys.order("po-1")) as PurchaseOrderResponseDto).status).toBe("PendingApproval");
  });
});

describe("Mutations de Reorder Rule — sem cache de detalhe/listagem (nenhuma Query existe)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useCreateReorderRule devolve a Regra criada, sem cache associado", async () => {
    const rule = { ruleId: "rule-1", tenantId: "tenant-1", productId: "product-1", thresholdQuantity: 10, reorderQuantity: 50, active: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" };
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(rule, 201))));

    const { result } = renderHook(() => useCreateReorderRule(), { wrapper });
    result.current.mutate({ tenantId: "tenant-1", productId: "product-1", thresholdQuantity: 10, reorderQuantity: 50 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(rule);
  });

  it("useDeactivateReorderRule devolve a Regra desativada, sem cache associado", async () => {
    const rule = { ruleId: "rule-1", tenantId: "tenant-1", productId: "product-1", thresholdQuantity: 10, reorderQuantity: 50, active: false, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" };
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(rule))));

    const { result } = renderHook(() => useDeactivateReorderRule(), { wrapper });
    result.current.mutate("rule-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.active).toBe(false);
  });

  it("useEvaluateReorderRule sincroniza a Requisition resultante quando a Regra dispara", async () => {
    const evaluation = {
      rule: { ruleId: "rule-1", tenantId: "tenant-1", productId: "product-1", thresholdQuantity: 10, reorderQuantity: 50, active: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
      triggered: true,
      requisition: requisition({ origin: "ReorderRule", requisitionId: "req-2" }),
    };
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(evaluation))));

    const { result } = renderHook(() => useEvaluateReorderRule(), { wrapper });
    result.current.mutate({ ruleId: "rule-1", payload: { currentQuantity: 5 } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(purchaseQueryKeys.requisition("req-2"))).toEqual(evaluation.requisition);
  });

  it("useEvaluateReorderRule não sincroniza nada quando a Regra não dispara", async () => {
    const evaluation = {
      rule: { ruleId: "rule-1", tenantId: "tenant-1", productId: "product-1", thresholdQuantity: 10, reorderQuantity: 50, active: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
      triggered: false,
    };
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse(evaluation))));

    const { result } = renderHook(() => useEvaluateReorderRule(), { wrapper });
    result.current.mutate({ ruleId: "rule-1", payload: { currentQuantity: 20 } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.triggered).toBe(false);
  });
});
