import type { Money } from './Money';

/**
 * TaxCalculation — resultado determinístico da aplicação de uma `TaxRule` vigente a uma linha de
 * `FiscalDocument` (`FISCAL_HUB.md`, Capítulo 5) — "é sempre o resultado determinístico de uma Tax
 * Rule vigente no momento do cálculo, nunca um valor editável manualmente" (ADR-FI-002). Sem
 * Repository próprio — `FISCAL_HUB.md`, Capítulo 9, especifica apenas quatro Repository Interfaces
 * (`FiscalDocumentRepository`/`TaxRuleRepository`/`FiscalObligationRepository`/`TaxRegimeRepository`),
 * nenhuma para `TaxCalculation` — vive sempre como parte interna de `FiscalDocumentLine.taxCalculation`
 * (Capítulo 5: "Tax Calculation aplicado"), mesma disciplina de `BOMLine` (Production Hub) nunca
 * referenciada por identificador fora do Aggregate que a contém.
 */
export interface TaxCalculation {
  /** Identificador do registro de cálculo. */
  readonly taxCalculationId: string;

  /** Fiscal Document Line à qual este cálculo se refere — correlação exigida pelo payload de
   * `TaxCalculated` (`DOMAIN_EVENT_CATALOG.md`). */
  readonly fiscalDocumentLineId: string;

  /** Tax Rule aplicada. */
  readonly taxRuleId: string;

  /** Valor de imposto calculado. */
  readonly amount: Money;

  /** Momento em que o cálculo foi realizado. */
  readonly calculatedAt: Date;
}
