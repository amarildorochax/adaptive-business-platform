import { PurchaseDomainError } from "@abp/purchase-hub";
import { ConflictError, HttpError, NotFoundError, UnprocessableEntityError } from "./HttpError.js";
import { mapDomainError } from "./mapDomainError.js";

/**
 * Tradução de erro específica das rotas `/purchase-orders*`/`/purchase-requisitions*`/
 * `/receivings*`/`/reorder-rules*` — mesmo mecanismo já adotado por `mapSupplierError.ts` (IMP-203):
 * uma função de domínio específica que delega a `mapDomainError` (FUN-004) como fallback, nunca um
 * sistema paralelo. `mapDomainError.ts` permanece inteiramente intocado, per instrução explícita.
 *
 * `PurchaseManager` (Core, IMP-301) lança `PurchaseDomainError` — a mesma disciplina de hierarquia
 * tipada já adotada por `SupplierDomainError`, mapeada aqui por `instanceof`/`code`, nunca por
 * heurística de texto, pela mesma razão já registrada em `mapSupplierError.ts`: a informação correta
 * já existe de forma estruturada.
 *
 * Auditoria desta Sprint (Passo 1) não encontrou nenhuma mensagem de `PurchaseDomainError` fora do
 * alcance da heurística de `mapDomainError` — a divergência real que motivou a criação de
 * `mapSupplierError.ts` (IMP-203) não se repete aqui porque este arquivo mapeia por `code`, nunca
 * delegando a heurística de texto para nenhum dos catorze erros tipados; `mapDomainError` só é
 * alcançado para um erro genuinamente fora de `PurchaseDomainError` (ver último `return` abaixo).
 */
export function mapPurchaseError(error: unknown): HttpError {
  if (error instanceof HttpError) {
    return error;
  }

  if (error instanceof PurchaseDomainError) {
    switch (error.code) {
      case "PURCHASE_ORDER_NOT_FOUND":
      case "PURCHASE_ORDER_ITEM_NOT_FOUND":
      case "PURCHASE_REQUISITION_NOT_FOUND":
      case "REORDER_RULE_NOT_FOUND":
        return new NotFoundError(error.message);
      case "PURCHASE_ORDER_ITEM_ADDITION_NOT_ALLOWED":
      case "PURCHASE_ORDER_INVALID_STATUS_TRANSITION":
      case "PURCHASE_ORDER_HAS_RECEIVING_CANNOT_CANCEL":
      case "PURCHASE_REQUISITION_INVALID_STATUS_TRANSITION":
      case "PURCHASE_REQUISITION_NOT_APPROVED":
        return new ConflictError(error.message);
      case "PURCHASE_ORDER_APPROVAL_REQUIRES_IDENTITY":
      case "RECEIVING_QUANTITY_EXCEEDS_PENDING":
      case "PURCHASE_INVALID_MONEY":
      case "PURCHASE_INVALID_RECEIVING_LINE":
      case "PURCHASE_MISSING_ACQUISITION_COST":
        return new UnprocessableEntityError(error.message);
      default:
        return mapDomainError(error);
    }
  }

  return mapDomainError(error);
}
