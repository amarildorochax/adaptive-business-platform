import { apiClient } from "../http/client.js";
import { undefinedOn404 } from "../http/undefinedOn404.js";
import type {
  CalculateTaxRequestDto,
  CancelFiscalDocumentRequestDto,
  CreateTaxRuleRequestDto,
  EvaluateFiscalObligationsRequestDto,
  EvaluateFiscalObligationsResponseDto,
  FiscalDocumentResponseDto,
  FiscalObligationResponseDto,
  IssueFiscalDocumentRequestDto,
  RegisterFiscalObligationRequestDto,
  RegisterTaxRegimeRequestDto,
  TaxCalculationDto,
  TaxRegimeResponseDto,
  TaxRuleResponseDto,
} from "./fiscal.dto.js";

/**
 * Cliente HTTP do Fiscal Hub — espelha `apps/api/src/routes/fiscal.ts` (IMP-603), rota a rota, mesma
 * disciplina de `productionClient.ts`/`inventoryMovementClient.ts`/`purchaseClient.ts`/
 * `supplierClient.ts`. Quinze métodos, um por endpoint — nenhum acessa `FiscalManager` diretamente,
 * toda comunicação passa exclusivamente por `apiClient` (`core/http/client.ts`), a mesma instância
 * única já usada por toda a aplicação.
 *
 * `findTaxRegimeByTenant`/`findTaxRuleById`/`findFiscalDocumentById` usam `undefinedOn404` — em todos
 * os três, "não encontrado" é um estado de negócio legítimo (Tenant ainda sem Tax Regime registrado,
 * identificador ainda não conhecido/carregado), mesmo critério de `findBillOfMaterialsById`/
 * `findProductionOrderById` (Production Hub).
 *
 * `calculateTax` NUNCA usa `undefinedOn404` — diferente dos três `find*` acima, um 404 aqui
 * (`NoApplicableTaxRuleFoundError`, IMP-603) sinaliza que nenhuma Tax Rule vigente existe para a
 * combinação informada, um estado que o chamador precisa tratar explicitamente (ex.: alertar "nenhuma
 * regra fiscal configurada"), nunca um silêncio equivalente a "ainda carregando" — mesmo critério de
 * `getTotalConsumedCost`/`getTotalGeneratedQuantity` (Production Hub). Decisão documentada em
 * `IMP_604_FISCAL_FRONTEND_INFRASTRUCTURE_REPORT.md`.
 */
export const fiscalClient = {
  // ---- Tax Regime ----

  registerTaxRegime(payload: RegisterTaxRegimeRequestDto): Promise<TaxRegimeResponseDto> {
    return apiClient.post("/tax-regimes", payload);
  },

  findTaxRegimeByTenant(tenantId: string): Promise<TaxRegimeResponseDto | undefined> {
    return undefinedOn404(() => apiClient.get(`/tax-regimes/${encodeURIComponent(tenantId)}`));
  },

  // ---- Tax Rule ----

  createTaxRule(payload: CreateTaxRuleRequestDto): Promise<TaxRuleResponseDto> {
    return apiClient.post("/tax-rules", payload);
  },

  findTaxRuleById(taxRuleId: string): Promise<TaxRuleResponseDto | undefined> {
    return undefinedOn404(() => apiClient.get(`/tax-rules/${encodeURIComponent(taxRuleId)}`));
  },

  deactivateTaxRule(taxRuleId: string): Promise<TaxRuleResponseDto> {
    return apiClient.post(`/tax-rules/${encodeURIComponent(taxRuleId)}/deactivate`);
  },

  // ---- Tax Calculation ----

  calculateTax(payload: CalculateTaxRequestDto): Promise<TaxCalculationDto> {
    return apiClient.post("/tax-calculations", payload);
  },

  // ---- Fiscal Document ----

  issueFiscalDocument(payload: IssueFiscalDocumentRequestDto): Promise<FiscalDocumentResponseDto> {
    return apiClient.post("/fiscal-documents", payload);
  },

  findFiscalDocumentById(fiscalDocumentId: string): Promise<FiscalDocumentResponseDto | undefined> {
    return undefinedOn404(() => apiClient.get(`/fiscal-documents/${encodeURIComponent(fiscalDocumentId)}`));
  },

  listFiscalDocumentsByOrigin(orderId: string): Promise<readonly FiscalDocumentResponseDto[]> {
    return apiClient.get(`/fiscal-documents/by-origin/${encodeURIComponent(orderId)}`);
  },

  cancelFiscalDocument(fiscalDocumentId: string, payload: CancelFiscalDocumentRequestDto): Promise<FiscalDocumentResponseDto> {
    return apiClient.post(`/fiscal-documents/${encodeURIComponent(fiscalDocumentId)}/cancel`, payload);
  },

  // ---- Fiscal Obligation ----

  registerFiscalObligation(payload: RegisterFiscalObligationRequestDto): Promise<FiscalObligationResponseDto> {
    return apiClient.post("/fiscal-obligations", payload);
  },

  listPendingFiscalObligations(): Promise<readonly FiscalObligationResponseDto[]> {
    return apiClient.get("/fiscal-obligations/pending");
  },

  listOverdueFiscalObligations(): Promise<readonly FiscalObligationResponseDto[]> {
    return apiClient.get("/fiscal-obligations/overdue");
  },

  fulfillFiscalObligation(fiscalObligationId: string): Promise<FiscalObligationResponseDto> {
    return apiClient.post(`/fiscal-obligations/${encodeURIComponent(fiscalObligationId)}/fulfill`);
  },

  evaluateFiscalObligations(payload: EvaluateFiscalObligationsRequestDto): Promise<EvaluateFiscalObligationsResponseDto> {
    return apiClient.post("/fiscal-obligations/evaluate-overdue", payload);
  },
};
