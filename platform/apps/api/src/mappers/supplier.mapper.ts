import type { Supplier, SupplierCatalogItem, SupplierContact, SupplierContract, SupplierPerformanceRecord } from "@abp/supplier-hub";
import type {
  SupplierCatalogItemResponseDto,
  SupplierContactResponseDto,
  SupplierContractResponseDto,
  SupplierPerformanceRecordResponseDto,
  SupplierResponseDto,
} from "../dtos/supplier.dto.js";

export function toSupplierContactResponseDto(contact: SupplierContact): SupplierContactResponseDto {
  return {
    contactId: contact.contactId,
    supplierId: contact.supplierId,
    name: contact.name,
    channelId: contact.channelId,
    role: contact.role,
  };
}

export function toSupplierResponseDto(supplier: Supplier): SupplierResponseDto {
  return {
    supplierId: supplier.supplierId,
    tenantId: supplier.tenantId,
    legalName: supplier.legalName,
    taxId: supplier.taxId.value,
    status: supplier.status,
    supplyCategory: supplier.supplyCategory,
    contacts: supplier.contacts.map(toSupplierContactResponseDto),
    createdAt: supplier.createdAt.toISOString(),
    updatedAt: supplier.updatedAt.toISOString(),
  };
}

export function toSupplierCatalogItemResponseDto(item: SupplierCatalogItem): SupplierCatalogItemResponseDto {
  return {
    catalogItemId: item.catalogItemId,
    supplierId: item.supplierId,
    tenantId: item.tenantId,
    productId: item.productId,
    listPrice: { amount: item.listPrice.amount, currencyCode: item.listPrice.currencyCode },
    leadTimeInDays: item.leadTimeInDays,
    minimumOrderQuantity: item.minimumOrderQuantity,
    createdAt: item.createdAt.toISOString(),
  };
}

export function toSupplierContractResponseDto(contract: SupplierContract): SupplierContractResponseDto {
  return {
    contractId: contract.contractId,
    supplierId: contract.supplierId,
    tenantId: contract.tenantId,
    startsAt: contract.startsAt.toISOString(),
    endsAt: contract.endsAt?.toISOString(),
    paymentTermsDueInDays: contract.paymentTerms.dueInDays,
    minimumVolume: contract.minimumVolume,
    createdAt: contract.createdAt.toISOString(),
  };
}

export function toSupplierPerformanceRecordResponseDto(record: SupplierPerformanceRecord): SupplierPerformanceRecordResponseDto {
  return {
    recordId: record.recordId,
    supplierId: record.supplierId,
    tenantId: record.tenantId,
    purchaseOrderId: record.purchaseOrderId,
    observationType: record.observationType,
    observedAt: record.observedAt.toISOString(),
  };
}
