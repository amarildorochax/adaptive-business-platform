import { FiscalDomainError } from "@abp/fiscal-hub";
import { ConflictError, HttpError, NotFoundError, UnprocessableEntityError } from "./HttpError.js";
import { mapDomainError } from "./mapDomainError.js";

/**
 * Tradução de erro específica das rotas `/tax-regimes*`/`/tax-rules*`/`/tax-calculations*`/
 * `/fiscal-documents*`/`/fiscal-obligations*` — mesmo mecanismo já adotado por `mapProductionError.ts`/
 * `mapInventoryMovementError.ts`/`mapPurchaseError.ts`/`mapSupplierError.ts`: uma função de domínio
 * específica que delega a `mapDomainError` (FUN-004) como fallback, nunca um sistema paralelo.
 * `mapDomainError.ts` permanece inteiramente intocado, per instrução explícita.
 *
 * `FiscalManager` (Core, IMP-601) lança `FiscalDomainError` — mesma disciplina de hierarquia tipada já
 * adotada por `ProductionDomainError`/`InventoryDomainError`/`PurchaseDomainError`/`SupplierDomainError`,
 * mapeada aqui por `instanceof`/`code`, nunca por heurística de texto.
 *
 * Auditoria desta Sprint (Passo 1) não encontrou nenhuma mensagem de `FiscalDomainError` fora do
 * alcance da heurística de `mapDomainError` — `mapDomainError` só é alcançado para um erro genuinamente
 * fora de `FiscalDomainError` (ver último `return` abaixo), mesma conclusão já documentada por
 * IMP-303/IMP-403/IMP-503 para seus respectivos Hubs.
 *
 * Categorização dos quinze `code` (per `FiscalDomainError.ts`, Core, congelado):
 * - 404: identificador informado não existe (`TaxRegime`/`TaxRule`/`FiscalDocument`/`FiscalObligation`),
 *   ou nenhuma Tax Rule vigente foi encontrada para a combinação informada (`NoApplicableTaxRuleFound`
 *   — semanticamente "recurso implícito não encontrado", nunca um dado malformado de entrada).
 * - 409: estado do Aggregate impede a operação — Tenant já possui Tax Regime, ou transição de status
 *   inválida (`FiscalDocument`/`FiscalObligation`) — mesma categoria já usada para
 *   `PRODUCTION_ORDER_INVALID_STATUS_TRANSITION` em `mapProductionError.ts`.
 * - 422: dado de entrada inválido (nome vazio, classificação vazia, alíquota negativa, valor monetário
 *   inválido, linha de documento inválida, obrigação sem tipo/periodicidade, documento sem origem).
 */
export function mapFiscalError(error: unknown): HttpError {
  if (error instanceof HttpError) {
    return error;
  }

  if (error instanceof FiscalDomainError) {
    switch (error.code) {
      case "FISCAL_TAX_REGIME_NOT_FOUND":
      case "FISCAL_TAX_RULE_NOT_FOUND":
      case "FISCAL_NO_APPLICABLE_TAX_RULE_FOUND":
      case "FISCAL_DOCUMENT_NOT_FOUND":
      case "FISCAL_OBLIGATION_NOT_FOUND":
        return new NotFoundError(error.message);
      case "FISCAL_DUPLICATE_TAX_REGIME":
      case "FISCAL_DOCUMENT_INVALID_STATUS_TRANSITION":
      case "FISCAL_OBLIGATION_INVALID_STATUS_TRANSITION":
        return new ConflictError(error.message);
      case "FISCAL_INVALID_TAX_REGIME_NAME":
      case "FISCAL_INVALID_TAX_CLASSIFICATION":
      case "FISCAL_INVALID_TAX_RATE":
      case "FISCAL_INVALID_MONEY":
      case "FISCAL_DOCUMENT_MISSING_ORIGIN":
      case "FISCAL_INVALID_DOCUMENT_LINE":
      case "FISCAL_INVALID_OBLIGATION":
        return new UnprocessableEntityError(error.message);
      default:
        return mapDomainError(error);
    }
  }

  return mapDomainError(error);
}
