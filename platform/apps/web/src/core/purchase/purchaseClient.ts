import { apiClient } from "../http/client.js";
import { undefinedOn404 } from "../http/undefinedOn404.js";
import type {
  AddPurchaseOrderItemRequestDto,
  ApprovePurchaseOrderRequestDto,
  ConvertRequisitionToPurchaseOrderRequestDto,
  ConvertRequisitionToPurchaseOrderResponseDto,
  CreatePurchaseOrderRequestDto,
  CreatePurchaseRequisitionRequestDto,
  CreateReorderRuleRequestDto,
  EvaluateReorderRuleRequestDto,
  EvaluateReorderRuleResponseDto,
  PurchaseOrderResponseDto,
  PurchaseRequisitionResponseDto,
  RegisterReceivingRequestDto,
  RegisterReceivingResponseDto,
  ReceivingResponseDto,
  ReorderRuleResponseDto,
} from "./purchase.dto.js";

/**
 * Cliente HTTP do Purchase Hub — espelha `apps/api/src/routes/purchase.ts` (IMP-303), rota a rota,
 * mesma disciplina de `supplierClient.ts` (IMP-204). Dezenove métodos, um por endpoint — nenhum
 * acessa `PurchaseManager` diretamente, toda comunicação passa exclusivamente por `apiClient`
 * (`core/http/client.ts`), a mesma instância única já usada por toda a aplicação.
 */
export const purchaseClient = {
  // ---- Purchase Order ----

  createPurchaseOrder(payload: CreatePurchaseOrderRequestDto): Promise<PurchaseOrderResponseDto> {
    return apiClient.post("/purchase-orders", payload);
  },

  findPurchaseOrderById(purchaseOrderId: string): Promise<PurchaseOrderResponseDto | undefined> {
    return undefinedOn404(() => apiClient.get(`/purchase-orders/${encodeURIComponent(purchaseOrderId)}`));
  },

  listOpenPurchaseOrdersByTenant(tenantId: string): Promise<readonly PurchaseOrderResponseDto[]> {
    return apiClient.get(`/purchase-orders/by-tenant/${encodeURIComponent(tenantId)}/open`);
  },

  listPurchaseOrdersBySupplier(supplierId: string): Promise<readonly PurchaseOrderResponseDto[]> {
    return apiClient.get(`/purchase-orders/by-supplier/${encodeURIComponent(supplierId)}`);
  },

  addPurchaseOrderItem(purchaseOrderId: string, payload: AddPurchaseOrderItemRequestDto): Promise<PurchaseOrderResponseDto> {
    return apiClient.post(`/purchase-orders/${encodeURIComponent(purchaseOrderId)}/items`, payload);
  },

  approvePurchaseOrder(purchaseOrderId: string, payload: ApprovePurchaseOrderRequestDto): Promise<PurchaseOrderResponseDto> {
    return apiClient.post(`/purchase-orders/${encodeURIComponent(purchaseOrderId)}/approve`, payload);
  },

  sendPurchaseOrderToSupplier(purchaseOrderId: string): Promise<PurchaseOrderResponseDto> {
    return apiClient.post(`/purchase-orders/${encodeURIComponent(purchaseOrderId)}/send`);
  },

  cancelPurchaseOrder(purchaseOrderId: string): Promise<PurchaseOrderResponseDto> {
    return apiClient.post(`/purchase-orders/${encodeURIComponent(purchaseOrderId)}/cancel`);
  },

  listReceivingsByPurchaseOrder(purchaseOrderId: string): Promise<readonly ReceivingResponseDto[]> {
    return apiClient.get(`/purchase-orders/${encodeURIComponent(purchaseOrderId)}/receivings`);
  },

  // ---- Receiving ----

  /**
   * `POST /receivings` (IMP-303). LIMITAÇÃO CONHECIDA, per instrução explícita de IMP-304: um
   * segundo `registerReceiving` contra o mesmo Purchase Order falha com 500 (bug real de
   * Persistência, IMP-302, documentado em `IMP_303_PURCHASE_HTTP_API_REPORT.md`, Capítulo 8, nunca
   * corrigido). Este método nunca simula, mascara ou contorna essa limitação — o erro real do
   * servidor (`ApiError`, statusCode 500) propaga normalmente ao chamador, exatamente como qualquer
   * outro erro HTTP desta camada. Nenhum retry, nenhum fallback, nenhum workaround.
   */
  registerReceiving(payload: RegisterReceivingRequestDto): Promise<RegisterReceivingResponseDto> {
    return apiClient.post("/receivings", payload);
  },

  // ---- Purchase Requisition ----

  createPurchaseRequisition(payload: CreatePurchaseRequisitionRequestDto): Promise<PurchaseRequisitionResponseDto> {
    return apiClient.post("/purchase-requisitions", payload);
  },

  findPurchaseRequisitionById(requisitionId: string): Promise<PurchaseRequisitionResponseDto | undefined> {
    return undefinedOn404(() => apiClient.get(`/purchase-requisitions/${encodeURIComponent(requisitionId)}`));
  },

  listPurchaseRequisitionsByStatus(
    tenantId: string,
    status: "Open" | "Approved" | "Rejected" | "ConvertedToPurchaseOrder",
  ): Promise<readonly PurchaseRequisitionResponseDto[]> {
    return apiClient.get(`/purchase-requisitions/by-tenant/${encodeURIComponent(tenantId)}/status/${encodeURIComponent(status)}`);
  },

  approvePurchaseRequisition(requisitionId: string): Promise<PurchaseRequisitionResponseDto> {
    return apiClient.post(`/purchase-requisitions/${encodeURIComponent(requisitionId)}/approve`);
  },

  rejectPurchaseRequisition(requisitionId: string): Promise<PurchaseRequisitionResponseDto> {
    return apiClient.post(`/purchase-requisitions/${encodeURIComponent(requisitionId)}/reject`);
  },

  convertRequisitionToPurchaseOrder(
    requisitionId: string,
    payload: ConvertRequisitionToPurchaseOrderRequestDto,
  ): Promise<ConvertRequisitionToPurchaseOrderResponseDto> {
    return apiClient.post(`/purchase-requisitions/${encodeURIComponent(requisitionId)}/convert`, payload);
  },

  // ---- Reorder Rule ----

  createReorderRule(payload: CreateReorderRuleRequestDto): Promise<ReorderRuleResponseDto> {
    return apiClient.post("/reorder-rules", payload);
  },

  deactivateReorderRule(ruleId: string): Promise<ReorderRuleResponseDto> {
    return apiClient.post(`/reorder-rules/${encodeURIComponent(ruleId)}/deactivate`);
  },

  evaluateReorderRule(ruleId: string, payload: EvaluateReorderRuleRequestDto): Promise<EvaluateReorderRuleResponseDto> {
    return apiClient.post(`/reorder-rules/${encodeURIComponent(ruleId)}/evaluate`, payload);
  },
};
