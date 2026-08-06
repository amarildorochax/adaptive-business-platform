import type { FiscalDocumentLine } from './FiscalDocumentLine';
import { isValidFiscalDocumentLine } from './FiscalDocumentLine';
import type { FiscalDocumentStatus } from './FiscalDocument';
import {
  DuplicateTaxRegimeError,
  FiscalDocumentInvalidStatusTransitionError,
  FiscalDocumentMissingOriginError,
  FiscalObligationInvalidStatusTransitionError,
  InvalidFiscalDocumentLineError,
  InvalidFiscalObligationError,
  InvalidMoneyError,
  InvalidTaxClassificationError,
  InvalidTaxRateError,
  InvalidTaxRegimeNameError,
  NoApplicableTaxRuleFoundError,
} from './FiscalDomainError';
import { isValidFiscalObligation, type FiscalObligation, type FiscalObligationStatus } from './FiscalObligation';
import { canTransitionFiscalDocumentStatus, canTransitionFiscalObligationStatus } from './FiscalPolicy';
import { isValidMoney, type Money } from './Money';
import { isValidTaxClassification, type TaxClassification } from './TaxClassification';
import { isValidTaxRate, type TaxRate } from './TaxRate';
import type { TaxRegime } from './TaxRegime';
import type { TaxRule } from './TaxRule';

/**
 * FiscalValidator — a implementação real das validações de domínio do Fiscal Hub, mesma disciplina de
 * `ProductionValidator`/`InventoryValidator`/`PurchaseValidator`: lança `FiscalDomainError` de fato,
 * nunca apenas um catálogo declarativo de regras adiado para um "Validation Engine" futuro. Consulta
 * `FiscalPolicy` (pura) antes de decidir se lança.
 */
export class FiscalValidator {
  /** O nome de um Tax Regime é obrigatório e não pode ser vazio. */
  ensureValidTaxRegimeName(name: string): void {
    if (name.trim().length === 0) {
      throw new InvalidTaxRegimeNameError();
    }
  }

  /** "Associado a exatamente uma Empresa por Tenant" (`FISCAL_HUB.md`, Capítulo 5) — `RegisterTaxRegime`
   * nunca é aceito para um Tenant que já possui um Tax Regime registrado. */
  ensureNoDuplicateTaxRegime(tenantId: string, existing: TaxRegime | undefined): void {
    if (existing) {
      throw new DuplicateTaxRegimeError(tenantId);
    }
  }

  /** Validação de `TaxClassification`. */
  ensureValidTaxClassification(classification: TaxClassification): void {
    if (!isValidTaxClassification(classification)) {
      throw new InvalidTaxClassificationError();
    }
  }

  /** Validação de `TaxRate`. */
  ensureValidTaxRate(rate: TaxRate): void {
    if (!isValidTaxRate(rate)) {
      throw new InvalidTaxRateError();
    }
  }

  /** Validação de `Money`, mesma disciplina de `PurchaseValidator.ensureValidMoney`. */
  ensureValidMoney(money: Money): void {
    if (!isValidMoney(money)) {
      throw new InvalidMoneyError();
    }
  }

  /** "Tax Calculation é sempre o resultado determinístico de uma Tax Rule vigente" (ADR-FI-002) — sem
   * regra aplicável, `CalculateTax` nunca prossegue. Retorna a regra para uso imediato pelo chamador. */
  ensureApplicableTaxRuleFound(rule: TaxRule | undefined, taxRegimeId: string): TaxRule {
    if (!rule) {
      throw new NoApplicableTaxRuleFoundError(taxRegimeId);
    }

    return rule;
  }

  /** "Todo Fiscal Document referencia exatamente uma origem (Order ou Invoice) — nunca é criado sem
   * correlação rastreável a uma transação real já confirmada" (`FISCAL_HUB.md`, Capítulo 11). */
  ensureFiscalDocumentHasOrigin(orderId: string | undefined, invoiceId: string | undefined): void {
    if (!orderId && !invoiceId) {
      throw new FiscalDocumentMissingOriginError();
    }
  }

  /** Validação de `FiscalDocumentLine`. */
  ensureValidFiscalDocumentLine(line: FiscalDocumentLine): void {
    if (!isValidFiscalDocumentLine(line)) {
      throw new InvalidFiscalDocumentLineError();
    }
  }

  /** A transição de status de Fiscal Document solicitada é legítima. */
  ensureFiscalDocumentStatusTransitionAllowed(from: FiscalDocumentStatus, to: FiscalDocumentStatus): void {
    if (!canTransitionFiscalDocumentStatus(from, to)) {
      throw new FiscalDocumentInvalidStatusTransitionError(from, to);
    }
  }

  /** Validação de `FiscalObligation` (`type`/`periodicity`). */
  ensureValidFiscalObligation(obligation: Pick<FiscalObligation, 'type' | 'periodicity'>): void {
    if (!isValidFiscalObligation(obligation)) {
      throw new InvalidFiscalObligationError();
    }
  }

  /** A transição de status de Fiscal Obligation solicitada é legítima. */
  ensureFiscalObligationStatusTransitionAllowed(from: FiscalObligationStatus, to: FiscalObligationStatus): void {
    if (!canTransitionFiscalObligationStatus(from, to)) {
      throw new FiscalObligationInvalidStatusTransitionError(from, to);
    }
  }
}
