import { FiscalFactory, type RegisterTaxRegimeInput } from './FiscalFactory';
import { FiscalValidator } from './FiscalValidator';
import type { TaxRegime } from './TaxRegime';
import type { TaxRegimeRepository } from './TaxRegimeRepository';

/**
 * TaxRegimeService — Service base do Aggregate `TaxRegime`. `FISCAL_HUB.md`, Capítulo 10, não nomeia
 * um Service próprio para este Aggregate (apenas `TaxCalculationService`,
 * `FiscalDocumentIssuanceService` e `FiscalObligationTrackingService`) — complementação natural de
 * implementação, mesma disciplina de `WorkCenterService` (Production Hub, IMP-501).
 */
export class TaxRegimeService {
  private readonly factory = new FiscalFactory();
  private readonly validator = new FiscalValidator();

  constructor(private readonly repository: TaxRegimeRepository) {}

  async register(input: RegisterTaxRegimeInput): Promise<TaxRegime> {
    this.validator.ensureValidTaxRegimeName(input.name);

    const existing = await this.repository.findByTenant(input.tenantId);
    this.validator.ensureNoDuplicateTaxRegime(input.tenantId, existing);

    const regime = this.factory.createTaxRegime(input);
    return this.repository.save(regime);
  }

  async getByTenant(tenantId: string): Promise<TaxRegime | undefined> {
    return this.repository.findByTenant(tenantId);
  }
}
