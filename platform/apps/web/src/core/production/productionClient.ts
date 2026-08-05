import { apiClient } from "../http/client.js";
import { undefinedOn404 } from "../http/undefinedOn404.js";
import type {
  BillOfMaterialsResponseDto,
  CancelProductionRequestDto,
  CreateBillOfMaterialsRequestDto,
  CreateProductionOrderRequestDto,
  CreateWorkCenterRequestDto,
  ProductionOrderResponseDto,
  RegisterProductionConsumptionRequestDto,
  RegisterProductionConsumptionResponseDto,
  RegisterProductionOutputRequestDto,
  RegisterProductionOutputResponseDto,
  StartProductionRequestDto,
  StartProductionResponseDto,
  SupersedeBillOfMaterialsRequestDto,
  SupersedeBillOfMaterialsResponseDto,
  TotalConsumedCostResponseDto,
  TotalGeneratedQuantityResponseDto,
  WorkCenterResponseDto,
} from "./production.dto.js";

/**
 * Cliente HTTP do Production Hub — espelha `apps/api/src/routes/production.ts` (IMP-503), rota a
 * rota, mesma disciplina de `inventoryMovementClient.ts`/`purchaseClient.ts`/`supplierClient.ts`.
 * Dezessete métodos, um por endpoint — nenhum acessa `ProductionManager` diretamente, toda
 * comunicação passa exclusivamente por `apiClient` (`core/http/client.ts`), a mesma instância única
 * já usada por toda a aplicação.
 *
 * `getTotalConsumedCost`/`getTotalGeneratedQuantity` NUNCA usam `undefinedOn404` — diferente de
 * `findBillOfMaterialsById`/`findActiveBillOfMaterialsForProduct`/`findProductionOrderById` (onde
 * "não encontrado" é um estado de negócio legítimo, ex.: Produto ainda sem BOM), estes dois métodos
 * só fazem sentido chamados com um `productionOrderId` já conhecido/válido — um 404 aqui sinaliza uma
 * referência inválida real, não um estado esperado, e deve propagar como erro normalmente. Decisão
 * documentada em `IMP_504_PRODUCTION_FRONTEND_REPORT.md`.
 */
export const productionClient = {
  // ---- Bill of Materials ----

  createBillOfMaterials(payload: CreateBillOfMaterialsRequestDto): Promise<BillOfMaterialsResponseDto> {
    return apiClient.post("/bills-of-materials", payload);
  },

  supersedeBillOfMaterials(
    billOfMaterialsId: string,
    payload: SupersedeBillOfMaterialsRequestDto,
  ): Promise<SupersedeBillOfMaterialsResponseDto> {
    return apiClient.post(`/bills-of-materials/${encodeURIComponent(billOfMaterialsId)}/supersede`, payload);
  },

  findBillOfMaterialsById(billOfMaterialsId: string): Promise<BillOfMaterialsResponseDto | undefined> {
    return undefinedOn404(() => apiClient.get(`/bills-of-materials/${encodeURIComponent(billOfMaterialsId)}`));
  },

  findActiveBillOfMaterialsForProduct(outputProductId: string): Promise<BillOfMaterialsResponseDto | undefined> {
    return undefinedOn404(() => apiClient.get(`/bills-of-materials/by-product/${encodeURIComponent(outputProductId)}/active`));
  },

  // ---- Production Order ----

  createProductionOrder(payload: CreateProductionOrderRequestDto): Promise<ProductionOrderResponseDto> {
    return apiClient.post("/production-orders", payload);
  },

  findProductionOrderById(productionOrderId: string): Promise<ProductionOrderResponseDto | undefined> {
    return undefinedOn404(() => apiClient.get(`/production-orders/${encodeURIComponent(productionOrderId)}`));
  },

  listProductionOrdersByStatus(status: string): Promise<readonly ProductionOrderResponseDto[]> {
    return apiClient.get(`/production-orders/by-status/${encodeURIComponent(status)}`);
  },

  listProductionOrdersByOrigin(orderId: string): Promise<readonly ProductionOrderResponseDto[]> {
    return apiClient.get(`/production-orders/by-origin/${encodeURIComponent(orderId)}`);
  },

  getTotalConsumedCost(productionOrderId: string): Promise<TotalConsumedCostResponseDto> {
    return apiClient.get(`/production-orders/${encodeURIComponent(productionOrderId)}/total-consumed-cost`);
  },

  getTotalGeneratedQuantity(productionOrderId: string): Promise<TotalGeneratedQuantityResponseDto> {
    return apiClient.get(`/production-orders/${encodeURIComponent(productionOrderId)}/total-generated-quantity`);
  },

  startProduction(productionOrderId: string, payload: StartProductionRequestDto): Promise<StartProductionResponseDto> {
    return apiClient.post(`/production-orders/${encodeURIComponent(productionOrderId)}/start`, payload);
  },

  registerProductionConsumption(
    productionOrderId: string,
    payload: RegisterProductionConsumptionRequestDto,
  ): Promise<RegisterProductionConsumptionResponseDto> {
    return apiClient.post(`/production-orders/${encodeURIComponent(productionOrderId)}/consumptions`, payload);
  },

  registerProductionOutput(
    productionOrderId: string,
    payload: RegisterProductionOutputRequestDto,
  ): Promise<RegisterProductionOutputResponseDto> {
    return apiClient.post(`/production-orders/${encodeURIComponent(productionOrderId)}/outputs`, payload);
  },

  completeProduction(productionOrderId: string): Promise<ProductionOrderResponseDto> {
    return apiClient.post(`/production-orders/${encodeURIComponent(productionOrderId)}/complete`);
  },

  cancelProduction(productionOrderId: string, payload: CancelProductionRequestDto): Promise<ProductionOrderResponseDto> {
    return apiClient.post(`/production-orders/${encodeURIComponent(productionOrderId)}/cancel`, payload);
  },

  // ---- Work Center ----

  createWorkCenter(payload: CreateWorkCenterRequestDto): Promise<WorkCenterResponseDto> {
    return apiClient.post("/work-centers", payload);
  },

  listActiveWorkCenters(): Promise<readonly WorkCenterResponseDto[]> {
    return apiClient.get("/work-centers/active");
  },
};
