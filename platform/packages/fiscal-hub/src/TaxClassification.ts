/**
 * TaxClassification — código de classificação fiscal de um item, equivalente conceitual a NCM
 * (`FISCAL_HUB.md`, Capítulo 6). Nunca modelado como campo livre-texto de Produto no Commerce Hub —
 * referenciado a partir de `FiscalDocumentLine`/`TaxRule` por este Value Object, mantendo o Catalog do
 * Commerce Hub livre de conceito fiscal (Capítulo 3: "Fiscal Hub nunca decide o preço de venda de um
 * Produto... consome Price/Order Item já confirmado pelo Commerce Hub, apenas para calcular a base de
 * cálculo do imposto").
 */
export interface TaxClassification {
  /** Código de classificação fiscal (ex.: NCM), sem máscara. */
  readonly code: string;
}

export function isValidTaxClassification(classification: TaxClassification): boolean {
  return classification.code.trim().length > 0;
}
