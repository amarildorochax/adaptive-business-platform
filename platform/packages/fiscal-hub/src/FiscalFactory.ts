import type { FiscalDocument, FiscalDocumentType } from './FiscalDocument';
import type { FiscalDocumentLine } from './FiscalDocumentLine';
import type { FiscalObligation } from './FiscalObligation';
import type { Money } from './Money';
import type { TaxCalculation } from './TaxCalculation';
import type { TaxClassification } from './TaxClassification';
import type { TaxRate } from './TaxRate';
import type { TaxRegime } from './TaxRegime';
import type { TaxRule } from './TaxRule';

/**
 * FiscalFactory — construção de cada Entidade do Fiscal Hub, isolando geração de identificador e
 * atribuição de padrão (`status: 'Issued'`/`'Pending'`, `active: true`) do restante da lógica de
 * `Service`, mesma disciplina de responsabilidade única já exigida por IMP-201/301/401/501.
 */
export interface RegisterTaxRegimeInput {
  readonly tenantId: string;
  readonly name: string;
}

export interface CreateTaxRuleInput {
  readonly tenantId: string;
  readonly taxRegimeId: string;
  readonly classification: TaxClassification;
  readonly rate: TaxRate;
  readonly exemptionCondition?: string;
  readonly validFrom: Date;
  readonly validUntil?: Date;
}

export interface IssueFiscalDocumentLineInput {
  /** Gerado pelo chamador — ver nota em `FiscalDocumentLine.ts`. */
  readonly fiscalDocumentLineId: string;
  readonly productId: string;
  readonly quantity: number;
  readonly unitValue: Money;
  readonly classification: TaxClassification;
  readonly taxCalculation: TaxCalculation;
}

export interface IssueFiscalDocumentInput {
  readonly tenantId: string;
  readonly type: FiscalDocumentType;
  readonly orderId?: string;
  readonly invoiceId?: string;
  readonly lines: readonly IssueFiscalDocumentLineInput[];
  readonly number?: string;
  readonly series?: string;
}

export interface RegisterFiscalObligationInput {
  readonly tenantId: string;
  readonly type: string;
  readonly periodicity: string;
  readonly dueDate: Date;
}

export class FiscalFactory {
  createTaxRegime(input: RegisterTaxRegimeInput): TaxRegime {
    return {
      taxRegimeId: crypto.randomUUID(),
      tenantId: input.tenantId,
      name: input.name,
      createdAt: new Date(),
    };
  }

  createTaxRule(input: CreateTaxRuleInput): TaxRule {
    const now = new Date();

    return {
      taxRuleId: crypto.randomUUID(),
      tenantId: input.tenantId,
      taxRegimeId: input.taxRegimeId,
      classification: input.classification,
      rate: input.rate,
      exemptionCondition: input.exemptionCondition,
      validFrom: input.validFrom,
      validUntil: input.validUntil,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
  }

  /** `amount` já vem computado por `FiscalPolicy.computeTaxAmount` — a Factory nunca aplica a regra de
   * cálculo em si, apenas monta o registro (mesma disciplina de "Factory nunca contém regra de
   * negócio", `ADAPTIVE_DEVELOPMENT_STANDARD.md`, Capítulo 5). */
  createTaxCalculation(fiscalDocumentLineId: string, taxRuleId: string, amount: Money): TaxCalculation {
    return {
      taxCalculationId: crypto.randomUUID(),
      fiscalDocumentLineId,
      taxRuleId,
      amount,
      calculatedAt: new Date(),
    };
  }

  createFiscalDocument(input: IssueFiscalDocumentInput): FiscalDocument {
    const now = new Date();
    const lines: FiscalDocumentLine[] = input.lines.map((line) => ({
      fiscalDocumentLineId: line.fiscalDocumentLineId,
      productId: line.productId,
      quantity: line.quantity,
      unitValue: line.unitValue,
      classification: line.classification,
      taxCalculation: line.taxCalculation,
    }));

    return {
      fiscalDocumentId: crypto.randomUUID(),
      tenantId: input.tenantId,
      type: input.type,
      orderId: input.orderId,
      invoiceId: input.invoiceId,
      lines,
      status: 'Issued',
      number: input.number,
      series: input.series,
      issuedAt: now,
      createdAt: now,
      updatedAt: now,
    };
  }

  createFiscalObligation(input: RegisterFiscalObligationInput): FiscalObligation {
    const now = new Date();

    return {
      fiscalObligationId: crypto.randomUUID(),
      tenantId: input.tenantId,
      type: input.type,
      periodicity: input.periodicity,
      dueDate: input.dueDate,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    };
  }
}
