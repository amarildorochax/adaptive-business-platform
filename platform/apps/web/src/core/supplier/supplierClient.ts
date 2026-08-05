import { apiClient } from "../http/client.js";
import { undefinedOn404 } from "../http/undefinedOn404.js";
import type {
  AddSupplierContactRequestDto,
  CreateSupplierContractRequestDto,
  RecordSupplierPerformanceRequestDto,
  RegisterSupplierCatalogItemRequestDto,
  RegisterSupplierRequestDto,
  SupplierCatalogItemResponseDto,
  SupplierContractResponseDto,
  SupplierPerformanceRecordResponseDto,
  SupplierResponseDto,
  UpdateSupplierCatalogItemRequestDto,
  UpdateSupplierRequestDto,
} from "./supplier.dto.js";

/**
 * Cliente HTTP do Supplier Hub — espelha `apps/api/src/routes/supplier.ts` (IMP-203), rota a rota,
 * mesma disciplina de `crmClient.ts`/`businessProfileClient.ts`. Onze métodos, um por endpoint —
 * nenhum acessa `SupplierManager` diretamente, toda comunicação passa exclusivamente por
 * `apiClient` (`core/http/client.ts`), a mesma instância única já usada por toda a aplicação e já
 * configurada pelo interceptor de autenticação (`AuthProvider`) — nenhum código de autenticação
 * novo é introduzido aqui.
 */
export const supplierClient = {
  register(payload: RegisterSupplierRequestDto): Promise<SupplierResponseDto> {
    return apiClient.post("/suppliers", payload);
  },

  findById(supplierId: string): Promise<SupplierResponseDto | undefined> {
    return undefinedOn404(() => apiClient.get(`/suppliers/${encodeURIComponent(supplierId)}`));
  },

  listByTenant(tenantId: string): Promise<readonly SupplierResponseDto[]> {
    return apiClient.get(`/suppliers/by-tenant/${encodeURIComponent(tenantId)}`);
  },

  update(supplierId: string, payload: UpdateSupplierRequestDto): Promise<SupplierResponseDto> {
    return apiClient.patch(`/suppliers/${encodeURIComponent(supplierId)}`, payload);
  },

  disable(supplierId: string): Promise<SupplierResponseDto> {
    return apiClient.post(`/suppliers/${encodeURIComponent(supplierId)}/disable`);
  },

  reactivate(supplierId: string): Promise<SupplierResponseDto> {
    return apiClient.post(`/suppliers/${encodeURIComponent(supplierId)}/reactivate`);
  },

  addContact(supplierId: string, payload: AddSupplierContactRequestDto): Promise<SupplierResponseDto> {
    return apiClient.post(`/suppliers/${encodeURIComponent(supplierId)}/contacts`, payload);
  },

  registerCatalogItem(payload: RegisterSupplierCatalogItemRequestDto): Promise<SupplierCatalogItemResponseDto> {
    return apiClient.post("/supplier-catalog-items", payload);
  },

  updateCatalogItem(catalogItemId: string, payload: UpdateSupplierCatalogItemRequestDto): Promise<SupplierCatalogItemResponseDto> {
    return apiClient.patch(`/supplier-catalog-items/${encodeURIComponent(catalogItemId)}`, payload);
  },

  createContract(payload: CreateSupplierContractRequestDto): Promise<SupplierContractResponseDto> {
    return apiClient.post("/supplier-contracts", payload);
  },

  recordPerformance(payload: RecordSupplierPerformanceRequestDto): Promise<readonly SupplierPerformanceRecordResponseDto[]> {
    return apiClient.post("/supplier-performance-records", payload);
  },
};
