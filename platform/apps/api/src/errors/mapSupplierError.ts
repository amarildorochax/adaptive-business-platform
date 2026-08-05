import { SupplierDomainError } from "@abp/supplier-hub";
import { ConflictError, HttpError, NotFoundError, UnprocessableEntityError } from "./HttpError.js";
import { mapDomainError } from "./mapDomainError.js";

/**
 * Tradução de erro específica das rotas `/suppliers*`/`/supplier-*` — mesmo mecanismo já adotado
 * por `mapIamError.ts` (FUN-100): uma função de domínio específica que delega a `mapDomainError`
 * (FUN-004) como fallback, nunca um sistema paralelo.
 *
 * Diferente de todo Manager anterior (CRM, Business Profile, Branding, IAM), que sempre lança
 * `Error` puro, `SupplierManager` (Core, IMP-201) lança uma hierarquia tipada real —
 * `SupplierDomainError`, com um `code` estável por subclasse (`SupplierDomainError.ts`). Esta é a
 * primeira Sprint de API a encontrar esse caso — mapeada aqui por `instanceof`/`code`, nunca por
 * heurística de texto, porque a informação correta já existe de forma estruturada, tornando a
 * heurística de `mapDomainError` desnecessária e estritamente menos precisa para este domínio.
 *
 * Divergência real encontrada e documentada (per instrução explícita de IMP-203, "não corrigir
 * silenciosamente"): a heurística de `mapDomainError` não reconhece a mensagem de
 * `InvalidTaxIdError` ("não respeita o formato aceito") nem de `InvalidMoneyError` ("Valor
 * monetário inválido") — nenhuma delas contém "inválido" no início da frase nem os padrões
 * "precisa"/"deve ser"/"não pode"/"obrigatório" já reconhecidos; cairiam em 500
 * (`InternalServerError`) se este pacote reutilizasse apenas `mapDomainError` sem esta camada
 * adicional. Corrigido aqui, não em `mapDomainError.ts` (que permanece intocado, per "nunca
 * reaproveitada por nenhuma outra rota" já documentado em `mapIamError.ts`), evitando qualquer
 * risco de reclassificar uma mensagem de outro domínio já em produção.
 */
export function mapSupplierError(error: unknown): HttpError {
  if (error instanceof HttpError) {
    return error;
  }

  if (error instanceof SupplierDomainError) {
    switch (error.code) {
      case "SUPPLIER_NOT_FOUND":
      case "SUPPLIER_CATALOG_ITEM_NOT_FOUND":
        return new NotFoundError(error.message);
      case "SUPPLIER_DUPLICATE_TAX_ID":
      case "SUPPLIER_INVALID_STATUS_TRANSITION":
        return new ConflictError(error.message);
      case "SUPPLIER_INVALID_TAX_ID":
      case "SUPPLIER_INVALID_MONEY":
        return new UnprocessableEntityError(error.message);
      default:
        return mapDomainError(error);
    }
  }

  return mapDomainError(error);
}
