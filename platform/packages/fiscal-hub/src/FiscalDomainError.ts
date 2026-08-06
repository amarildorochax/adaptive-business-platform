/**
 * FiscalDomainError — a taxonomia de erro de domínio do Fiscal Hub, distinta de `PlatformError`
 * (`@abp/shared`) e nunca reutilizando `ProductionDomainError`/`InventoryDomainError`/
 * `PurchaseDomainError`/`SupplierDomainError`, per instrução explícita desta Sprint ("Criar Errors
 * específicos. Nunca reutilizar Errors de outros Hubs") — mesma disciplina já registrada em
 * `packages/production-hub/src/ProductionDomainError.ts`. Cada classe aqui representa a violação de
 * uma regra específica já registrada em `FISCAL_HUB.md`, Capítulo 11 ("Regras de Negócio"), nunca uma
 * condição técnica genérica.
 */

export abstract class FiscalDomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Nenhum Tax Regime foi encontrado para o Tenant informado. */
export class TaxRegimeNotFoundError extends FiscalDomainError {
  readonly code = 'FISCAL_TAX_REGIME_NOT_FOUND';

  constructor(tenantId: string) {
    super(`Nenhum Tax Regime encontrado para o Tenant ${tenantId}.`);
  }
}

/** `RegisterTaxRegime` foi chamado para um Tenant que já possui um Tax Regime — regra "associado a
 * exatamente uma Empresa por Tenant" (`FISCAL_HUB.md`, Capítulo 5). */
export class DuplicateTaxRegimeError extends FiscalDomainError {
  readonly code = 'FISCAL_DUPLICATE_TAX_REGIME';

  constructor(tenantId: string) {
    super(`O Tenant ${tenantId} já possui um Tax Regime registrado.`);
  }
}

/** O nome de um Tax Regime é obrigatório e não pode ser vazio. */
export class InvalidTaxRegimeNameError extends FiscalDomainError {
  readonly code = 'FISCAL_INVALID_TAX_REGIME_NAME';

  constructor() {
    super('Tax Regime inválido — o nome é obrigatório e não pode ser vazio.');
  }
}

/** Nenhuma Tax Rule foi encontrada para o identificador informado. */
export class TaxRuleNotFoundError extends FiscalDomainError {
  readonly code = 'FISCAL_TAX_RULE_NOT_FOUND';

  constructor(taxRuleId: string) {
    super(`Tax Rule ${taxRuleId} não encontrada.`);
  }
}

/** A `TaxClassification` informada é inválida (código vazio). */
export class InvalidTaxClassificationError extends FiscalDomainError {
  readonly code = 'FISCAL_INVALID_TAX_CLASSIFICATION';

  constructor() {
    super('Classificação fiscal inválida — o código é obrigatório e não pode ser vazio.');
  }
}

/** A `TaxRate` informada é inválida (valor negativo ou não finito). */
export class InvalidTaxRateError extends FiscalDomainError {
  readonly code = 'FISCAL_INVALID_TAX_RATE';

  constructor() {
    super('Alíquota inválida — o valor deve ser não negativo.');
  }
}

/** O `Money` informado é inválido (valor negativo, não finito, ou moeda vazia) — mesma disciplina de
 * `InvalidMoneyError` em `packages/purchase-hub/src/PurchaseDomainError.ts`. */
export class InvalidMoneyError extends FiscalDomainError {
  readonly code = 'FISCAL_INVALID_MONEY';

  constructor() {
    super('Valor monetário inválido — o valor deve ser não negativo e a moeda informada.');
  }
}

/**
 * `CalculateTax` não encontrou nenhuma `TaxRule` ativa e vigente para a combinação de Tax Regime e
 * classificação fiscal informada, na data do cálculo — "Tax Calculation é sempre o resultado
 * determinístico de uma Tax Rule vigente" (`FISCAL_HUB.md`, ADR-FI-002); sem regra vigente, não há
 * cálculo determinístico possível.
 */
export class NoApplicableTaxRuleFoundError extends FiscalDomainError {
  readonly code = 'FISCAL_NO_APPLICABLE_TAX_RULE_FOUND';

  constructor(taxRegimeId: string) {
    super(`Nenhuma Tax Rule vigente encontrada para o Tax Regime ${taxRegimeId} na data do cálculo.`);
  }
}

/** Nenhum Fiscal Document foi encontrado para o identificador informado. */
export class FiscalDocumentNotFoundError extends FiscalDomainError {
  readonly code = 'FISCAL_DOCUMENT_NOT_FOUND';

  constructor(fiscalDocumentId: string) {
    super(`Fiscal Document ${fiscalDocumentId} não encontrado.`);
  }
}

/** `IssueFiscalDocument` foi chamado sem `orderId` nem `invoiceId` — regra "Todo Fiscal Document
 * referencia exatamente uma origem (Order ou Invoice) — nunca é criado sem correlação rastreável a uma
 * transação real já confirmada" (`FISCAL_HUB.md`, Capítulo 11). */
export class FiscalDocumentMissingOriginError extends FiscalDomainError {
  readonly code = 'FISCAL_DOCUMENT_MISSING_ORIGIN';

  constructor() {
    super('Fiscal Document inválido — deve referenciar ao menos uma origem (orderId ou invoiceId).');
  }
}

/** A `FiscalDocumentLine` informada é inválida (quantidade não positiva ou valor unitário inválido). */
export class InvalidFiscalDocumentLineError extends FiscalDomainError {
  readonly code = 'FISCAL_INVALID_DOCUMENT_LINE';

  constructor() {
    super('Linha de Fiscal Document inválida — a quantidade deve ser positiva e o valor unitário válido.');
  }
}

/**
 * A transição de status solicitada não é permitida pela máquina de estados de `FiscalDocumentStatus`
 * — "sua única transição posterior permitida é Cancelled, nunca edição de item ou de valor"
 * (`FISCAL_HUB.md`, Capítulo 11).
 */
export class FiscalDocumentInvalidStatusTransitionError extends FiscalDomainError {
  readonly code = 'FISCAL_DOCUMENT_INVALID_STATUS_TRANSITION';

  constructor(from: string, to: string) {
    super(`Transição de status de Fiscal Document inválida: ${from} → ${to}.`);
  }
}

/** Nenhum Fiscal Obligation foi encontrado para o identificador informado. */
export class FiscalObligationNotFoundError extends FiscalDomainError {
  readonly code = 'FISCAL_OBLIGATION_NOT_FOUND';

  constructor(fiscalObligationId: string) {
    super(`Fiscal Obligation ${fiscalObligationId} não encontrado.`);
  }
}

/** O `FiscalObligation` informado é inválido (`type`/`periodicity` vazios). */
export class InvalidFiscalObligationError extends FiscalDomainError {
  readonly code = 'FISCAL_INVALID_OBLIGATION';

  constructor() {
    super('Fiscal Obligation inválido — tipo e periodicidade são obrigatórios e não podem ser vazios.');
  }
}

/** A transição de status solicitada não é permitida pela máquina de estados de
 * `FiscalObligationStatus`. */
export class FiscalObligationInvalidStatusTransitionError extends FiscalDomainError {
  readonly code = 'FISCAL_OBLIGATION_INVALID_STATUS_TRANSITION';

  constructor(from: string, to: string) {
    super(`Transição de status de Fiscal Obligation inválida: ${from} → ${to}.`);
  }
}
