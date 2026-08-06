/**
 * DTOs da camada Frontend Infrastructure para Fiscal Hub — cópia deliberada e completa de
 * `apps/api/src/dtos/fiscal.dto.ts` (IMP-603), mesma disciplina de `production.dto.ts`/
 * `purchase.dto.ts`/`inventoryMovement.dto.ts`/`supplier.dto.ts`. Nunca um import cross-app — "Nunca
 * compartilhar DTOs entre aplicações" (per instrução explícita desta Sprint).
 *
 * `Money`/`TaxClassification`/`TaxRate` permanecem objetos aninhados (`MoneyDto`/`TaxClassificationDto`/
 * `TaxRateDto`) — mesma exceção deliberada já herdada de `apps/api`.
 *
 * `TaxCalculationDto` é reutilizado tanto como resposta de `POST /tax-calculations` quanto embutido em
 * `IssueFiscalDocumentLineRequestDto.taxCalculation` — reflete `IssueFiscalDocumentLineInput.taxCalculation`
 * (Core), que espera o objeto `TaxCalculation` já produzido por uma chamada anterior a `CalculateTax`,
 * nunca recalculado internamente por `IssueFiscalDocument`.
 *
 * Nenhum DTO de atualização parcial (`PATCH`) existe neste arquivo — nenhum dos oito Commands do Fiscal
 * Hub corresponde a uma atualização parcial por merge (IMP-603).
 */

export interface MoneyDto {
  readonly amount: number;
  readonly currencyCode: string;
}

export interface TaxClassificationDto {
  readonly code: string;
}

export type TaxRateTypeDto = "Percentage" | "Fixed";

export interface TaxRateDto {
  readonly type: TaxRateTypeDto;
  readonly value: number;
}

export type FiscalDocumentTypeDto = "Sale" | "Return" | "Transfer";
export type FiscalDocumentStatusDto = "Issued" | "Cancelled";
export type FiscalObligationStatusDto = "Pending" | "Fulfilled" | "Overdue";

// ---- Tax Regime ----

export interface RegisterTaxRegimeRequestDto {
  readonly tenantId: string;
  readonly name: string;
}

export interface TaxRegimeResponseDto {
  readonly taxRegimeId: string;
  readonly tenantId: string;
  readonly name: string;
  readonly createdAt: string;
}

// ---- Tax Rule ----

export interface CreateTaxRuleRequestDto {
  readonly tenantId: string;
  readonly taxRegimeId: string;
  readonly classification: TaxClassificationDto;
  readonly rate: TaxRateDto;
  readonly exemptionCondition?: string;
  readonly validFrom: string;
  readonly validUntil?: string;
}

export interface TaxRuleResponseDto {
  readonly taxRuleId: string;
  readonly tenantId: string;
  readonly taxRegimeId: string;
  readonly classification: TaxClassificationDto;
  readonly rate: TaxRateDto;
  readonly exemptionCondition?: string;
  readonly validFrom: string;
  readonly validUntil?: string;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ---- Tax Calculation ----

export interface CalculateTaxRequestDto {
  readonly fiscalDocumentLineId: string;
  readonly taxRegimeId: string;
  readonly classification: TaxClassificationDto;
  readonly baseAmount: MoneyDto;
  readonly calculationDate?: string;
}

export interface TaxCalculationDto {
  readonly taxCalculationId: string;
  readonly fiscalDocumentLineId: string;
  readonly taxRuleId: string;
  readonly amount: MoneyDto;
  readonly calculatedAt: string;
}

// ---- Fiscal Document ----

export interface IssueFiscalDocumentLineRequestDto {
  /** Gerado pelo chamador — ver nota em `@abp/fiscal-hub`, `FiscalDocumentLine.ts`. */
  readonly fiscalDocumentLineId: string;
  readonly productId: string;
  readonly quantity: number;
  readonly unitValue: MoneyDto;
  readonly classification: TaxClassificationDto;
  readonly taxCalculation: TaxCalculationDto;
}

export interface IssueFiscalDocumentRequestDto {
  readonly tenantId: string;
  readonly type: FiscalDocumentTypeDto;
  readonly orderId?: string;
  readonly invoiceId?: string;
  readonly lines: readonly IssueFiscalDocumentLineRequestDto[];
  readonly number?: string;
  readonly series?: string;
}

export interface FiscalDocumentLineResponseDto {
  readonly fiscalDocumentLineId: string;
  readonly productId: string;
  readonly quantity: number;
  readonly unitValue: MoneyDto;
  readonly classification: TaxClassificationDto;
  readonly taxCalculation: TaxCalculationDto;
}

export interface FiscalDocumentResponseDto {
  readonly fiscalDocumentId: string;
  readonly tenantId: string;
  readonly type: FiscalDocumentTypeDto;
  readonly orderId?: string;
  readonly invoiceId?: string;
  readonly lines: readonly FiscalDocumentLineResponseDto[];
  readonly status: FiscalDocumentStatusDto;
  readonly number?: string;
  readonly series?: string;
  readonly cancelReason?: string;
  readonly issuedAt: string;
  readonly cancelledAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CancelFiscalDocumentRequestDto {
  readonly reason: string;
}

// ---- Fiscal Obligation ----

export interface RegisterFiscalObligationRequestDto {
  readonly tenantId: string;
  readonly type: string;
  readonly periodicity: string;
  readonly dueDate: string;
}

export interface FiscalObligationResponseDto {
  readonly fiscalObligationId: string;
  readonly tenantId: string;
  readonly type: string;
  readonly periodicity: string;
  readonly dueDate: string;
  readonly status: FiscalObligationStatusDto;
  readonly fulfilledAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Corpo de `POST /fiscal-obligations/evaluate-overdue` — `asOfDate` reflete o parâmetro opcional de
 * `FiscalManager.evaluateFiscalObligations` (padrão: momento da chamada). */
export interface EvaluateFiscalObligationsRequestDto {
  readonly asOfDate?: string;
}

/** Reflete `EvaluateFiscalObligationsResult` (Core) — nunca um dos oito Commands aprovados, ver
 * `fiscalClient.ts`. */
export interface EvaluateFiscalObligationsResponseDto {
  readonly overdue: readonly FiscalObligationResponseDto[];
}
