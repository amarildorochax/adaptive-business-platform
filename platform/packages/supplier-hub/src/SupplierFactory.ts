import type { Money } from './Money';
import type { PaymentTerms } from './PaymentTerms';
import type { Supplier } from './Supplier';
import type { SupplierCatalogItem } from './SupplierCatalogItem';
import type { SupplierContact, SupplierContactRole } from './SupplierContact';
import type { SupplierContract } from './SupplierContract';
import type {
  SupplierPerformanceObservationType,
  SupplierPerformanceRecord,
} from './SupplierPerformanceRecord';
import type { TaxId } from './TaxId';

/**
 * SupplierFactory — construção de cada Entidade do Supplier Hub, isolando geração de
 * identificador e atribuição de padrão (`status: 'Active'` para todo novo Supplier, `contacts: []`
 * inicial) do restante da lógica de `Service`, mesma disciplina de responsabilidade única já
 * exigida por IMP-201 ("Cada Service deve possuir responsabilidade única").
 */
export interface CreateSupplierInput {
  readonly tenantId: string;
  readonly legalName: string;
  readonly taxId: TaxId;
  readonly supplyCategory?: string;
}

export interface CreateSupplierContactInput {
  readonly supplierId: string;
  readonly name: string;
  readonly channelId?: string;
  readonly role: SupplierContactRole;
}

export interface CreateSupplierCatalogItemInput {
  readonly supplierId: string;
  readonly tenantId: string;
  readonly productId: string;
  readonly listPrice: Money;
  readonly leadTimeInDays: number;
  readonly minimumOrderQuantity: number;
}

export interface CreateSupplierContractInput {
  readonly supplierId: string;
  readonly tenantId: string;
  readonly startsAt: Date;
  readonly endsAt?: Date;
  readonly paymentTerms: PaymentTerms;
  readonly minimumVolume?: number;
}

export interface CreateSupplierPerformanceRecordInput {
  readonly supplierId: string;
  readonly tenantId: string;
  readonly purchaseOrderId: string;
  readonly observationType: SupplierPerformanceObservationType;
  readonly observedAt: Date;
}

export class SupplierFactory {
  createSupplier(input: CreateSupplierInput): Supplier {
    const now = new Date();

    return {
      supplierId: crypto.randomUUID(),
      tenantId: input.tenantId,
      legalName: input.legalName,
      taxId: input.taxId,
      status: 'Active',
      supplyCategory: input.supplyCategory,
      contacts: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  createSupplierContact(input: CreateSupplierContactInput): SupplierContact {
    return {
      contactId: crypto.randomUUID(),
      supplierId: input.supplierId,
      name: input.name,
      channelId: input.channelId,
      role: input.role,
    };
  }

  createSupplierCatalogItem(input: CreateSupplierCatalogItemInput): SupplierCatalogItem {
    return {
      catalogItemId: crypto.randomUUID(),
      supplierId: input.supplierId,
      tenantId: input.tenantId,
      productId: input.productId,
      listPrice: input.listPrice,
      leadTimeInDays: input.leadTimeInDays,
      minimumOrderQuantity: input.minimumOrderQuantity,
      createdAt: new Date(),
    };
  }

  createSupplierContract(input: CreateSupplierContractInput): SupplierContract {
    return {
      contractId: crypto.randomUUID(),
      supplierId: input.supplierId,
      tenantId: input.tenantId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      paymentTerms: input.paymentTerms,
      minimumVolume: input.minimumVolume,
      createdAt: new Date(),
    };
  }

  createSupplierPerformanceRecord(
    input: CreateSupplierPerformanceRecordInput,
  ): SupplierPerformanceRecord {
    return {
      recordId: crypto.randomUUID(),
      supplierId: input.supplierId,
      tenantId: input.tenantId,
      purchaseOrderId: input.purchaseOrderId,
      observationType: input.observationType,
      observedAt: input.observedAt,
    };
  }
}
