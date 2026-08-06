import { FiscalFactory, type CreateTaxRuleInput } from './FiscalFactory';
import { TaxRuleNotFoundError } from './FiscalDomainError';
import { FiscalValidator } from './FiscalValidator';
import type { TaxRule } from './TaxRule';
import type { TaxRuleRepository } from './TaxRuleRepository';

/**
 * TaxRuleService — Service base do Aggregate `TaxRule` (criação e desativação), distinto de
 * `TaxCalculationService` (que aplica uma `TaxRule` já existente para produzir um cálculo, nunca
 * gerencia seu ciclo de vida). `FISCAL_HUB.md`, Capítulo 10, não nomeia um Service próprio para o
 * ciclo de vida de `TaxRule` — complementação natural de implementação, mesma disciplina de
 * `TaxRegimeService`.
 */
export class TaxRuleService {
  private readonly factory = new FiscalFactory();
  private readonly validator = new FiscalValidator();

  constructor(private readonly repository: TaxRuleRepository) {}

  async create(input: CreateTaxRuleInput): Promise<TaxRule> {
    this.validator.ensureValidTaxClassification(input.classification);
    this.validator.ensureValidTaxRate(input.rate);

    const rule = this.factory.createTaxRule(input);
    return this.repository.save(rule);
  }

  async deactivate(taxRuleId: string): Promise<TaxRule> {
    const existing = await this.getOrThrow(taxRuleId);

    return this.repository.save({ ...existing, active: false, updatedAt: new Date() });
  }

  async getById(taxRuleId: string): Promise<TaxRule | undefined> {
    return this.repository.findById(taxRuleId);
  }

  private async getOrThrow(taxRuleId: string): Promise<TaxRule> {
    const existing = await this.repository.findById(taxRuleId);

    if (!existing) {
      throw new TaxRuleNotFoundError(taxRuleId);
    }

    return existing;
  }
}
