/**
 * DTOs da camada HTTP para Supplier Hub — nunca `Supplier`/`SupplierContact`/`SupplierCatalogItem`/
 * `SupplierContract`/`SupplierPerformanceRecord` de `@abp/supplier-hub` usados diretamente, mesma
 * disciplina já aplicada a `crm.dto.ts`/`businessProfile.dto.ts`.
 *
 * Value Objects de campo único são achatados em primitivo (`TaxId` → `taxId: string`,
 * `PaymentTerms` → `paymentTermsDueInDays: number`) — decisão desta Sprint, documentada em
 * `IMP_203_SUPPLIER_HTTP_API_REPORT.md`, Capítulo "Decisões Tomadas". `Money`, por ter dois campos
 * que sempre viajam juntos, permanece um objeto aninhado (`{ amount, currencyCode }`).
 */

export interface RegisterSupplierRequestDto {
  readonly tenantId: string;
  readonly legalName: string;
  readonly taxId: string;
  readonly supplyCategory?: string;
}

export interface UpdateSupplierRequestDto {
  readonly legalName?: string;
  readonly supplyCategory?: string;
  readonly taxId?: string;
}

export interface AddSupplierContactRequestDto {
  readonly name: string;
  readonly channelId?: string;
  readonly role: "Commercial" | "Financial" | "Logistics";
}

export interface SupplierContactResponseDto {
  readonly contactId: string;
  readonly supplierId: string;
  readonly name: string;
  readonly channelId?: string;
  readonly role: string;
}

export interface SupplierResponseDto {
  readonly supplierId: string;
  readonly tenantId: string;
  readonly legalName: string;
  readonly taxId: string;
  readonly status: string;
  readonly supplyCategory?: string;
  readonly contacts: readonly SupplierContactResponseDto[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface MoneyDto {
  readonly amount: number;
  readonly currencyCode: string;
}

export interface RegisterSupplierCatalogItemRequestDto {
  readonly supplierId: string;
  readonly tenantId: string;
  readonly productId: string;
  readonly listPrice: MoneyDto;
  readonly leadTimeInDays: number;
  readonly minimumOrderQuantity: number;
}

export interface UpdateSupplierCatalogItemRequestDto {
  readonly listPrice?: MoneyDto;
  readonly leadTimeInDays?: number;
  readonly minimumOrderQuantity?: number;
}

export interface SupplierCatalogItemResponseDto {
  readonly catalogItemId: string;
  readonly supplierId: string;
  readonly tenantId: string;
  readonly productId: string;
  readonly listPrice: MoneyDto;
  readonly leadTimeInDays: number;
  readonly minimumOrderQuantity: number;
  readonly createdAt: string;
}

export interface CreateSupplierContractRequestDto {
  readonly supplierId: string;
  readonly tenantId: string;
  readonly startsAt: string;
  readonly endsAt?: string;
  readonly paymentTermsDueInDays: number;
  readonly minimumVolume?: number;
}

export interface SupplierContractResponseDto {
  readonly contractId: string;
  readonly supplierId: string;
  readonly tenantId: string;
  readonly startsAt: string;
  readonly endsAt?: string;
  readonly paymentTermsDueInDays: number;
  readonly minimumVolume?: number;
  readonly createdAt: string;
}

export interface RecordSupplierPerformanceRequestDto {
  readonly supplierId: string;
  readonly tenantId: string;
  readonly purchaseOrderId: string;
  readonly promisedAt: string;
  readonly receivedAt: string;
  readonly quantityOrdered: number;
  readonly quantityReceived: number;
}

export interface SupplierPerformanceRecordResponseDto {
  readonly recordId: string;
  readonly supplierId: string;
  readonly tenantId: string;
  readonly purchaseOrderId: string;
  readonly observationType: string;
  readonly observedAt: string;
}
