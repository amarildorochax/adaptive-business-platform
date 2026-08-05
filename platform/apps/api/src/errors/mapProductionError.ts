import { ProductionDomainError } from "@abp/production-hub";
import { ConflictError, HttpError, NotFoundError, UnprocessableEntityError } from "./HttpError.js";
import { mapDomainError } from "./mapDomainError.js";

/**
 * Tradução de erro específica das rotas `/bills-of-materials*`/`/production-orders*`/`/work-centers*`
 * — mesmo mecanismo já adotado por `mapInventoryMovementError.ts`/`mapPurchaseError.ts`/
 * `mapSupplierError.ts`: uma função de domínio específica que delega a `mapDomainError` (FUN-004) como
 * fallback, nunca um sistema paralelo. `mapDomainError.ts` permanece inteiramente intocado, per
 * instrução explícita.
 *
 * `ProductionManager` (Core, IMP-501) lança `ProductionDomainError` — mesma disciplina de hierarquia
 * tipada já adotada por `InventoryDomainError`/`PurchaseDomainError`/`SupplierDomainError`, mapeada
 * aqui por `instanceof`/`code`, nunca por heurística de texto.
 *
 * Auditoria desta Sprint (Passo 1) não encontrou nenhuma mensagem de `ProductionDomainError` fora do
 * alcance da heurística de `mapDomainError` — `mapDomainError` só é alcançado para um erro
 * genuinamente fora de `ProductionDomainError` (ver último `return` abaixo), mesma conclusão já
 * documentada por IMP-303/IMP-403 para seus respectivos Hubs.
 *
 * Categorização dos doze `code` (per `ProductionDomainError.ts`, Core, congelado):
 * - 404: identificador informado não existe (`BillOfMaterials`/`ProductionOrder`).
 * - 409: estado do Aggregate impede a operação — transição de status inválida, BOM não ativa, ou
 *   guarda específica de negócio (consumo/geração fora de InProgress, completar sem geração, cancelar
 *   com consumo já registrado) — mesma categoria já usada para `PURCHASE_ORDER_ITEM_ADDITION_NOT_ALLOWED`/
 *   `PURCHASE_ORDER_HAS_RECEIVING_CANNOT_CANCEL` em `mapPurchaseError.ts`.
 * - 422: dado de entrada inválido (quantidade não positiva, custo negativo, nome vazio).
 */
export function mapProductionError(error: unknown): HttpError {
  if (error instanceof HttpError) {
    return error;
  }

  if (error instanceof ProductionDomainError) {
    switch (error.code) {
      case "PRODUCTION_BILL_OF_MATERIALS_NOT_FOUND":
      case "PRODUCTION_ORDER_NOT_FOUND":
        return new NotFoundError(error.message);
      case "PRODUCTION_BILL_OF_MATERIALS_NOT_ACTIVE":
      case "PRODUCTION_ORDER_INVALID_STATUS_TRANSITION":
      case "PRODUCTION_CONSUMPTION_NOT_ALLOWED":
      case "PRODUCTION_OUTPUT_NOT_ALLOWED":
      case "PRODUCTION_ORDER_HAS_NO_OUTPUT_CANNOT_COMPLETE":
      case "PRODUCTION_ORDER_HAS_CONSUMPTION_CANNOT_CANCEL":
        return new ConflictError(error.message);
      case "PRODUCTION_INVALID_BOM_LINE":
      case "PRODUCTION_INVALID_PLANNED_OUTPUT_QUANTITY":
      case "PRODUCTION_INVALID_CONSUMPTION":
      case "PRODUCTION_INVALID_OUTPUT":
      case "PRODUCTION_INVALID_WORK_CENTER_NAME":
        return new UnprocessableEntityError(error.message);
      default:
        return mapDomainError(error);
    }
  }

  return mapDomainError(error);
}
