import type { FiscalDocumentStatus } from './FiscalDocument';
import type { FiscalObligation, FiscalObligationStatus } from './FiscalObligation';
import type { Money } from './Money';
import type { TaxRate } from './TaxRate';
import type { TaxRule } from './TaxRule';

/**
 * FiscalPolicy — decisões puras de negócio do Fiscal Hub, nunca lançam exceção (isso é
 * responsabilidade de `FiscalValidator`, que consulta esta Policy antes de decidir se lança um
 * `FiscalDomainError`). Cada função aqui é determinística e livre de efeito colateral, mesma
 * disciplina de `ProductionPolicy`/`InventoryPolicy`/`PurchasePolicy`.
 */

/**
 * Máquina de estados de `FiscalDocumentStatus` (`FISCAL_HUB.md`, Capítulo 5/11): `Issued` só
 * transiciona para `Cancelled`; `Cancelled` é estado final.
 */
export function canTransitionFiscalDocumentStatus(from: FiscalDocumentStatus, to: FiscalDocumentStatus): boolean {
  if (from === to) {
    return false;
  }

  return from === 'Issued' && to === 'Cancelled';
}

/**
 * Máquina de estados de `FiscalObligationStatus` (`FISCAL_HUB.md`, Capítulo 5): `Pending` transiciona
 * para `Fulfilled` (cumprida) ou `Overdue` (vencida, via avaliação periódica); `Overdue` ainda pode ser
 * cumprida (`Fulfilled`); `Fulfilled` é estado final.
 */
export function canTransitionFiscalObligationStatus(from: FiscalObligationStatus, to: FiscalObligationStatus): boolean {
  if (from === to) {
    return false;
  }

  switch (from) {
    case 'Pending':
      return to === 'Fulfilled' || to === 'Overdue';
    case 'Overdue':
      return to === 'Fulfilled';
    case 'Fulfilled':
      return false;
  }
}

/**
 * Uma `TaxRule` é aplicável em uma data quando está ativa (`DeactivateTaxRule` nunca a torna
 * novamente elegível) e a data cai dentro de sua vigência (`validFrom` ≤ data ≤ `validUntil`, quando
 * houver — ausência de `validUntil` significa vigência indefinida). Usado por
 * `TaxRuleRepository.findApplicable` (contrato de consulta) e por `TaxCalculationService` para validar
 * o resultado retornado.
 */
export function isTaxRuleApplicable(rule: Pick<TaxRule, 'active' | 'validFrom' | 'validUntil'>, date: Date): boolean {
  if (!rule.active) {
    return false;
  }

  if (date < rule.validFrom) {
    return false;
  }

  if (rule.validUntil && date > rule.validUntil) {
    return false;
  }

  return true;
}

/**
 * "Tax Calculation é sempre determinístico e reproduzível a partir da Tax Rule vigente na data do
 * cálculo" (`FISCAL_HUB.md`, ADR-FI-002) — a mesma entrada (base, alíquota) sempre produz a mesma
 * saída. Alíquota `Percentage` aplica-se sobre `baseAmount`; `Fixed` é um valor absoluto,
 * independente da base.
 */
export function computeTaxAmount(baseAmount: Money, rate: TaxRate): Money {
  const amount = rate.type === 'Percentage' ? (baseAmount.amount * rate.value) / 100 : rate.value;

  return { amount, currencyCode: baseAmount.currencyCode };
}

/**
 * Um Fiscal Obligation está vencido quando ainda não foi cumprido (`Pending`/`Overdue`) e sua
 * `dueDate` já passou em relação à data de avaliação — usado por
 * `FiscalObligationTrackingService.evaluateOverdue`.
 */
export function isFiscalObligationOverdue(
  obligation: Pick<FiscalObligation, 'status' | 'dueDate'>,
  asOfDate: Date,
): boolean {
  return (obligation.status === 'Pending' || obligation.status === 'Overdue') && obligation.dueDate < asOfDate;
}
