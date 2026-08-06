import type {
  EvaluateFiscalObligationsResult,
  FiscalDocument,
  FiscalDocumentLine,
  FiscalObligation,
  Money,
  TaxCalculation,
  TaxClassification,
  TaxRate,
  TaxRegime,
  TaxRule,
} from "@abp/fiscal-hub";
import type {
  EvaluateFiscalObligationsResponseDto,
  FiscalDocumentLineResponseDto,
  FiscalDocumentResponseDto,
  FiscalObligationResponseDto,
  MoneyDto,
  TaxCalculationDto,
  TaxClassificationDto,
  TaxRateDto,
  TaxRegimeResponseDto,
  TaxRuleResponseDto,
} from "../dtos/fiscal.dto.js";

function toMoneyDto(money: Money): MoneyDto {
  return { amount: money.amount, currencyCode: money.currencyCode };
}

function toTaxClassificationDto(classification: TaxClassification): TaxClassificationDto {
  return { code: classification.code };
}

function toTaxRateDto(rate: TaxRate): TaxRateDto {
  return { type: rate.type, value: rate.value };
}

export function toTaxRegimeResponseDto(regime: TaxRegime): TaxRegimeResponseDto {
  return {
    taxRegimeId: regime.taxRegimeId,
    tenantId: regime.tenantId,
    name: regime.name,
    createdAt: regime.createdAt.toISOString(),
  };
}

export function toTaxRuleResponseDto(rule: TaxRule): TaxRuleResponseDto {
  return {
    taxRuleId: rule.taxRuleId,
    tenantId: rule.tenantId,
    taxRegimeId: rule.taxRegimeId,
    classification: toTaxClassificationDto(rule.classification),
    rate: toTaxRateDto(rule.rate),
    exemptionCondition: rule.exemptionCondition,
    validFrom: rule.validFrom.toISOString(),
    validUntil: rule.validUntil?.toISOString(),
    active: rule.active,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  };
}

export function toTaxCalculationDto(calculation: TaxCalculation): TaxCalculationDto {
  return {
    taxCalculationId: calculation.taxCalculationId,
    fiscalDocumentLineId: calculation.fiscalDocumentLineId,
    taxRuleId: calculation.taxRuleId,
    amount: toMoneyDto(calculation.amount),
    calculatedAt: calculation.calculatedAt.toISOString(),
  };
}

function toFiscalDocumentLineResponseDto(line: FiscalDocumentLine): FiscalDocumentLineResponseDto {
  return {
    fiscalDocumentLineId: line.fiscalDocumentLineId,
    productId: line.productId,
    quantity: line.quantity,
    unitValue: toMoneyDto(line.unitValue),
    classification: toTaxClassificationDto(line.classification),
    taxCalculation: toTaxCalculationDto(line.taxCalculation),
  };
}

export function toFiscalDocumentResponseDto(document: FiscalDocument): FiscalDocumentResponseDto {
  return {
    fiscalDocumentId: document.fiscalDocumentId,
    tenantId: document.tenantId,
    type: document.type,
    orderId: document.orderId,
    invoiceId: document.invoiceId,
    lines: document.lines.map(toFiscalDocumentLineResponseDto),
    status: document.status,
    number: document.number,
    series: document.series,
    cancelReason: document.cancelReason,
    issuedAt: document.issuedAt.toISOString(),
    cancelledAt: document.cancelledAt?.toISOString(),
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

export function toFiscalObligationResponseDto(obligation: FiscalObligation): FiscalObligationResponseDto {
  return {
    fiscalObligationId: obligation.fiscalObligationId,
    tenantId: obligation.tenantId,
    type: obligation.type,
    periodicity: obligation.periodicity,
    dueDate: obligation.dueDate.toISOString(),
    status: obligation.status,
    fulfilledAt: obligation.fulfilledAt?.toISOString(),
    createdAt: obligation.createdAt.toISOString(),
    updatedAt: obligation.updatedAt.toISOString(),
  };
}

export function toEvaluateFiscalObligationsResponseDto(evaluation: EvaluateFiscalObligationsResult): EvaluateFiscalObligationsResponseDto {
  return { overdue: evaluation.overdue.map(toFiscalObligationResponseDto) };
}
