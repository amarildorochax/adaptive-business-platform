import type { TaxClassification } from './TaxClassification';
import type { TaxRate } from './TaxRate';

/**
 * TaxRule — Aggregate independente do Fiscal Hub (`FISCAL_HUB.md`, Capítulo 4). Representa uma regra
 * de cálculo (alíquota, base de cálculo, isenção condicional) vigente para uma combinação de
 * `TaxRegime`, classificação fiscal e jurisdição. `active` existe para suportar `DeactivateTaxRule`
 * (Capítulo 7) — nenhuma regra desativada é retornada por `TaxRuleRepository.findApplicable`, mesma
 * disciplina de `StockAlertRule.active`/`ReorderRule.active`.
 */
export interface TaxRule {
  /** Identificador do Tax Rule. */
  readonly taxRuleId: string;

  /** Tenant ao qual o Tax Rule pertence — isolamento absoluto entre Empresas. */
  readonly tenantId: string;

  /** Tax Regime ao qual esta regra se aplica. */
  readonly taxRegimeId: string;

  /** Classificação fiscal aplicável. */
  readonly classification: TaxClassification;

  /** Alíquota desta regra. */
  readonly rate: TaxRate;

  /** Condição de isenção, quando houver. */
  readonly exemptionCondition?: string;

  /** Início da vigência. */
  readonly validFrom: Date;

  /** Fim da vigência, quando houver — regra sem data de término permanece vigente indefinidamente. */
  readonly validUntil?: Date;

  /** Regra desativada nunca é retornada por `findApplicable` — `DeactivateTaxRule` nunca exclui o
   * registro, preserva rastreabilidade histórica de cálculo já realizado sob ela. */
  readonly active: boolean;

  /** Momento de criação. */
  readonly createdAt: Date;

  /** Momento da última alteração. */
  readonly updatedAt: Date;
}
