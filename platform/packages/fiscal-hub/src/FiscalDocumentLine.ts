import { isValidMoney, type Money } from './Money';
import type { TaxCalculation } from './TaxCalculation';
import type { TaxClassification } from './TaxClassification';

/**
 * FiscalDocumentLine — parte interna de `FiscalDocument` (`FISCAL_HUB.md`, Capítulo 4: "agrupa linha
 * de item fiscal como parte interna"), sem Repository próprio, mesma disciplina de `BOMLine`/
 * `PurchaseOrderItem`. `productId` referencia o Commerce Hub por identificador opaco, nunca por tipo
 * importado (Capítulo 3).
 */
export interface FiscalDocumentLine {
  /** Identificador da linha — gerado pelo chamador (não por `FiscalFactory`), porque precisa
   * permanecer estável entre a chamada a `CalculateTax` que a referencia (payload de `TaxCalculated`)
   * e a chamada subsequente a `IssueFiscalDocument` que a incorpora — mesma disciplina de correlação
   * por identificador estável já usada por `operationId` de Command. */
  readonly fiscalDocumentLineId: string;

  /** Produto referenciado por identificador opaco (Commerce Hub). */
  readonly productId: string;

  /** Quantidade da linha. */
  readonly quantity: number;

  /** Valor unitário. */
  readonly unitValue: Money;

  /** Classificação fiscal aplicável a esta linha. */
  readonly classification: TaxClassification;

  /** Cálculo tributário já aplicado — nunca ausente; `FiscalDocumentIssuanceService` nunca emite uma
   * linha sem `TaxCalculation` completo associado (Capítulo 10). */
  readonly taxCalculation: TaxCalculation;
}

export function isValidFiscalDocumentLine(line: Pick<FiscalDocumentLine, 'quantity' | 'unitValue'>): boolean {
  return Number.isFinite(line.quantity) && line.quantity > 0 && isValidMoney(line.unitValue);
}
