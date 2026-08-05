/**
 * DTOs do contrato HTTP do Supplier Hub — espelham exatamente `apps/api/src/dtos/supplier.dto.ts`
 * (IMP-203). Cópia deliberada, nunca um import cruzado entre `apps/web` e `apps/api` (nenhum
 * precedente disso existe no monorepo, mesma disciplina já documentada em
 * `businessProfile.dto.ts`/`crm.dto.ts`) — cada camada permanece independente, per instrução
 * explícita de IMP-204 ("Nunca compartilhar DTOs entre Backend e Frontend").
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
