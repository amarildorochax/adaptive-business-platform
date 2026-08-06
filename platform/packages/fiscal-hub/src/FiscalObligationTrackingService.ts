import { FiscalFactory, type RegisterFiscalObligationInput } from './FiscalFactory';
import { FiscalObligationNotFoundError } from './FiscalDomainError';
import type { FiscalObligation } from './FiscalObligation';
import type { FiscalObligationRepository } from './FiscalObligationRepository';
import { isFiscalObligationOverdue } from './FiscalPolicy';
import { FiscalValidator } from './FiscalValidator';

export interface EvaluateFiscalObligationsResult {
  /** Fiscal Obligations recém-transicionadas para `Overdue` nesta avaliação — nunca inclui obrigações
   * já `Overdue` de uma avaliação anterior, evitando publicar `FiscalObligationOverdue` duplicado para
   * o mesmo vencimento. */
  readonly overdue: readonly FiscalObligation[];
}

/**
 * FiscalObligationTrackingService — "avalia periodicamente Fiscal Obligation pendente e publica
 * FiscalObligationOverdue quando o vencimento é ultrapassado — acionado pelo Automation Engine, nunca
 * por agendador interno" (`FISCAL_HUB.md`, Capítulo 10). Um dos três Services explicitamente nomeados
 * por aquele documento. Também concentra `RegisterFiscalObligation`/`MarkFiscalObligationFulfilled` —
 * mesma disciplina de `ReorderEvaluationService` (Purchase Hub) concentrando todo o ciclo de vida de um
 * único Aggregate em um único Service nomeado pela arquitetura.
 *
 * `evaluateOverdue` não é um dos oito Commands aprovados (`FISCAL_HUB.md`, Capítulo 7) — mecanismo de
 * orquestração interna/periódica, mesmo padrão de `ReorderEvaluationService.evaluate`.
 */
export class FiscalObligationTrackingService {
  private readonly factory = new FiscalFactory();
  private readonly validator = new FiscalValidator();

  constructor(private readonly repository: FiscalObligationRepository) {}

  async register(input: RegisterFiscalObligationInput): Promise<FiscalObligation> {
    this.validator.ensureValidFiscalObligation(input);

    const obligation = this.factory.createFiscalObligation(input);
    return this.repository.save(obligation);
  }

  async markFulfilled(fiscalObligationId: string): Promise<FiscalObligation> {
    const existing = await this.getOrThrow(fiscalObligationId);
    this.validator.ensureFiscalObligationStatusTransitionAllowed(existing.status, 'Fulfilled');

    return this.repository.save({
      ...existing,
      status: 'Fulfilled',
      fulfilledAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async evaluateOverdue(asOfDate: Date = new Date()): Promise<EvaluateFiscalObligationsResult> {
    const pending = await this.repository.findPending();
    const overdue: FiscalObligation[] = [];

    for (const obligation of pending) {
      if (isFiscalObligationOverdue(obligation, asOfDate)) {
        const updated = await this.repository.save({
          ...obligation,
          status: 'Overdue',
          updatedAt: new Date(),
        });

        overdue.push(updated);
      }
    }

    return { overdue };
  }

  async listPending(): Promise<readonly FiscalObligation[]> {
    return this.repository.findPending();
  }

  async listOverdue(): Promise<readonly FiscalObligation[]> {
    return this.repository.findOverdue();
  }

  private async getOrThrow(fiscalObligationId: string): Promise<FiscalObligation> {
    const existing = await this.repository.findById(fiscalObligationId);

    if (!existing) {
      throw new FiscalObligationNotFoundError(fiscalObligationId);
    }

    return existing;
  }
}
