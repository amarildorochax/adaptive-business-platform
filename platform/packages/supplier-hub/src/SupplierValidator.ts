import { isValidMoney, type Money } from './Money';
import { canTransitionStatus } from './SupplierPolicy';
import type { SupplierRepository } from './SupplierRepository';
import type { SupplierStatus } from './Supplier';
import { isValidTaxIdFormat, type TaxId } from './TaxId';
import {
  DuplicateSupplierTaxIdError,
  InvalidMoneyError,
  InvalidTaxIdError,
  SupplierInvalidStatusTransitionError,
} from './SupplierDomainError';

/**
 * SupplierValidator — a implementação real das validações de domínio exigidas por IMP-201
 * ("Fornecedor ativo. Documento válido. Duplicidade. Status."). Diferente de `CRMBusinessRule.ts`
 * (catálogo puramente declarativo, verificação adiada para um "Validation Engine" futuro nunca
 * implementado), este Validator lança `SupplierDomainError` de fato — decisão registrada em
 * `docs/implementation/IMP_201_SUPPLIER_HUB_CORE_REPORT.md`, Capítulo 3, porque IMP-201 pede
 * explicitamente validação real, não apenas um catálogo de regras.
 */
export class SupplierValidator {
  constructor(private readonly repository: SupplierRepository) {}

  /** "Documento válido" — TaxId respeita o formato aceito nesta Sprint. */
  ensureValidTaxId(taxId: TaxId): void {
    if (!isValidTaxIdFormat(taxId.value)) {
      throw new InvalidTaxIdError(taxId.value);
    }
  }

  /**
   * "Duplicidade" — nenhum outro Supplier do mesmo Tenant já usa este TaxId. `excludeSupplierId`
   * permite que `UpdateSupplier` valide sem colidir consigo mesmo.
   */
  async ensureNoDuplicateTaxId(
    tenantId: string,
    taxId: TaxId,
    excludeSupplierId?: string,
  ): Promise<void> {
    const existing = await this.repository.findByTaxId(tenantId, taxId.value);

    if (existing && existing.supplierId !== excludeSupplierId) {
      throw new DuplicateSupplierTaxIdError(taxId.value);
    }
  }

  /** "Status" — a transição de status solicitada é legítima, per `SupplierPolicy.canTransitionStatus`. */
  ensureStatusTransitionAllowed(from: SupplierStatus, to: SupplierStatus): void {
    if (!canTransitionStatus(from, to)) {
      throw new SupplierInvalidStatusTransitionError(from, to);
    }
  }

  /** Validação de `Money`, reutilizada por `SupplierCatalogService`. */
  ensureValidMoney(money: Money): void {
    if (!isValidMoney(money)) {
      throw new InvalidMoneyError();
    }
  }
}
