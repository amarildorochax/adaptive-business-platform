/**
 * SupplierDomainError — a taxonomia de erro de domínio do Supplier Hub, distinta de
 * `PlatformError` (`@abp/shared`), que é deliberadamente "livre de regra de negócio". Cada classe
 * aqui representa a violação de uma regra específica já registrada em `SUPPLIER_HUB.md`, Capítulo
 * 11 ("Regras de Negócio"), nunca uma condição técnica genérica.
 */

export abstract class SupplierDomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Nenhum Supplier foi encontrado para o identificador informado. */
export class SupplierNotFoundError extends SupplierDomainError {
  readonly code = 'SUPPLIER_NOT_FOUND';

  constructor(supplierId: string) {
    super(`Supplier ${supplierId} não encontrado.`);
  }
}

/**
 * Um Supplier já cadastrado no Tenant possui o mesmo TaxId — regra "Todo Supplier é identificado
 * de forma única por TaxId dentro do Tenant" (`SUPPLIER_HUB.md`, Capítulo 11).
 */
export class DuplicateSupplierTaxIdError extends SupplierDomainError {
  readonly code = 'SUPPLIER_DUPLICATE_TAX_ID';

  constructor(taxIdValue: string) {
    super(`Já existe um Supplier com o identificador fiscal ${taxIdValue} neste Tenant.`);
  }
}

/** O TaxId informado não respeita o formato aceito (`TaxId.isValidTaxIdFormat`). */
export class InvalidTaxIdError extends SupplierDomainError {
  readonly code = 'SUPPLIER_INVALID_TAX_ID';

  constructor(taxIdValue: string) {
    super(`Identificador fiscal "${taxIdValue}" não respeita o formato aceito (CPF ou CNPJ, sem máscara).`);
  }
}

/**
 * A transição de status solicitada não é permitida pela máquina de estados de `SupplierStatus`
 * (`SupplierPolicy.canTransitionStatus`).
 */
export class SupplierInvalidStatusTransitionError extends SupplierDomainError {
  readonly code = 'SUPPLIER_INVALID_STATUS_TRANSITION';

  constructor(from: string, to: string) {
    super(`Transição de status inválida: ${from} → ${to}.`);
  }
}

/** O Money informado é inválido (valor negativo, não finito, ou moeda ausente). */
export class InvalidMoneyError extends SupplierDomainError {
  readonly code = 'SUPPLIER_INVALID_MONEY';

  constructor() {
    super('Valor monetário inválido — deve ser não negativo e possuir uma moeda válida.');
  }
}

/** Nenhum SupplierCatalogItem foi encontrado para o identificador informado. */
export class SupplierCatalogItemNotFoundError extends SupplierDomainError {
  readonly code = 'SUPPLIER_CATALOG_ITEM_NOT_FOUND';

  constructor(catalogItemId: string) {
    super(`SupplierCatalogItem ${catalogItemId} não encontrado.`);
  }
}
