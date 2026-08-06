import { FiscalFactory } from './FiscalFactory';
import { FiscalValidator } from './FiscalValidator';
import { computeTaxAmount } from './FiscalPolicy';
import type { Money } from './Money';
import type { TaxCalculation } from './TaxCalculation';
import type { TaxClassification } from './TaxClassification';
import type { TaxRuleRepository } from './TaxRuleRepository';

export interface CalculateTaxInput {
  /** Correlaciona este cálculo à linha de Fiscal Document que o consumirá — ver nota em
   * `FiscalDocumentLine.ts`. */
  readonly fiscalDocumentLineId: string;
  readonly taxRegimeId: string;
  readonly classification: TaxClassification;
  readonly baseAmount: Money;
  /** Data de referência da vigência da Tax Rule — padrão: momento da chamada. */
  readonly calculationDate?: Date;
}

/**
 * TaxCalculationService — "o único ponto que produz Tax Calculation, aplicando a Tax Rule vigente de
 * forma determinística — a mesma entrada (classificação, valor base, regime, data) sempre produz a
 * mesma saída, nunca sujeita a variação por implementação divergente em outro Hub" (`FISCAL_HUB.md`,
 * Capítulo 10). Um dos três Services explicitamente nomeados por aquele documento.
 *
 * Independente de `FiscalDocumentIssuanceService` — `CalculateTax` (Capítulo 7) é um Command próprio,
 * publicamente invocável (ex.: preview de imposto antes de uma emissão, consumido pelo futuro "Agente
 * de Conformidade Fiscal", Capítulo 8), nunca apenas um passo interno oculto de `IssueFiscalDocument`.
 */
export class TaxCalculationService {
  private readonly factory = new FiscalFactory();
  private readonly validator = new FiscalValidator();

  constructor(private readonly taxRuleRepository: TaxRuleRepository) {}

  async calculateTax(input: CalculateTaxInput): Promise<TaxCalculation> {
    this.validator.ensureValidTaxClassification(input.classification);
    this.validator.ensureValidMoney(input.baseAmount);

    const date = input.calculationDate ?? new Date();
    const rule = await this.taxRuleRepository.findApplicable(input.taxRegimeId, input.classification, date);
    const applicable = this.validator.ensureApplicableTaxRuleFound(rule, input.taxRegimeId);

    const amount = computeTaxAmount(input.baseAmount, applicable.rate);
    return this.factory.createTaxCalculation(input.fiscalDocumentLineId, applicable.taxRuleId, amount);
  }
}
