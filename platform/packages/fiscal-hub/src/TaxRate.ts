/**
 * TaxRate — alíquota de uma `TaxRule`, percentual ou fixa (`FISCAL_HUB.md`, Capítulo 6). A vigência
 * temporal referida por aquele Capítulo é modelada como campo próprio de `TaxRule`
 * (`validFrom`/`validUntil`, Capítulo 5: "vigência (data início/fim)"), nunca duplicada aqui — este
 * Value Object carrega apenas o valor da alíquota em si, decisão de leitura conjunta dos Capítulos 5 e
 * 6 documentada para evitar um campo de vigência redundante em dois lugares.
 */
export type TaxRateType = 'Percentage' | 'Fixed';

export interface TaxRate {
  /** Tipo de alíquota — percentual (aplicada sobre a base de cálculo) ou fixa (valor absoluto). */
  readonly type: TaxRateType;

  /** Valor da alíquota — percentual (0–100) quando `type` é `Percentage`, valor monetário absoluto
   * quando `Fixed`. */
  readonly value: number;
}

export function isValidTaxRate(rate: TaxRate): boolean {
  return Number.isFinite(rate.value) && rate.value >= 0;
}
