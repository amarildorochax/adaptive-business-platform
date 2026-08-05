/**
 * ProductionDomainError — a taxonomia de erro de domínio do Production Hub, distinta de
 * `PlatformError` (`@abp/shared`) e nunca reutilizando `SupplierDomainError`/`PurchaseDomainError`/
 * `InventoryDomainError`, per instrução explícita desta Sprint ("Criar Errors específicos. Nunca
 * reutilizar Errors de outros Hubs") — mesma disciplina já registrada em
 * `packages/inventory-movement-hub/src/InventoryDomainError.ts`. Cada classe aqui representa a
 * violação de uma regra específica já registrada em `PRODUCTION_HUB.md`, Capítulo 11 ("Regras de
 * Negócio"), nunca uma condição técnica genérica.
 */

export abstract class ProductionDomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Nenhuma BillOfMaterials foi encontrada para o identificador informado. */
export class BillOfMaterialsNotFoundError extends ProductionDomainError {
  readonly code = 'PRODUCTION_BILL_OF_MATERIALS_NOT_FOUND';

  constructor(billOfMaterialsId: string) {
    super(`BillOfMaterials ${billOfMaterialsId} não encontrada.`);
  }
}

/**
 * `SupersedeBillOfMaterials`/`CreateProductionOrder` foi chamado sobre uma BillOfMaterials cujo
 * status não é `Active` — regra "Toda Production Order referencia exatamente uma Bill of Materials
 * ativa no momento de sua criação — uma composição superada nunca origina nova Produção"
 * (`PRODUCTION_HUB.md`, Capítulo 11).
 */
export class BillOfMaterialsNotActiveError extends ProductionDomainError {
  readonly code = 'PRODUCTION_BILL_OF_MATERIALS_NOT_ACTIVE';

  constructor(billOfMaterialsId: string) {
    super(`BillOfMaterials ${billOfMaterialsId} não está ativa.`);
  }
}

/** A `BOMLine` informada é inválida (quantidade por unidade de saída não positiva). */
export class InvalidBOMLineError extends ProductionDomainError {
  readonly code = 'PRODUCTION_INVALID_BOM_LINE';

  constructor() {
    super('BOM Line inválida — a quantidade por unidade de saída deve ser positiva.');
  }
}

/** `CreateProductionOrder` foi chamado com `plannedOutputQuantity` não positiva. */
export class InvalidPlannedOutputQuantityError extends ProductionDomainError {
  readonly code = 'PRODUCTION_INVALID_PLANNED_OUTPUT_QUANTITY';

  constructor() {
    super('Quantidade de saída planejada inválida — deve ser positiva.');
  }
}

/** Nenhuma ProductionOrder foi encontrada para o identificador informado. */
export class ProductionOrderNotFoundError extends ProductionDomainError {
  readonly code = 'PRODUCTION_ORDER_NOT_FOUND';

  constructor(productionOrderId: string) {
    super(`ProductionOrder ${productionOrderId} não encontrada.`);
  }
}

/**
 * A transição de status solicitada não é permitida pela máquina de estados de `ProductionStatus`
 * (`ProductionPolicy.canTransitionProductionOrderStatus`).
 */
export class ProductionOrderInvalidStatusTransitionError extends ProductionDomainError {
  readonly code = 'PRODUCTION_ORDER_INVALID_STATUS_TRANSITION';

  constructor(from: string, to: string) {
    super(`Transição de status de ProductionOrder inválida: ${from} → ${to}.`);
  }
}

/**
 * `RegisterProductionConsumption` foi chamado sobre uma ProductionOrder que ainda não está
 * `InProgress` — consumo só é registrado após `StartProduction` bem-sucedido.
 */
export class ProductionConsumptionNotAllowedError extends ProductionDomainError {
  readonly code = 'PRODUCTION_CONSUMPTION_NOT_ALLOWED';

  constructor(productionOrderId: string, status: string) {
    super(`ProductionOrder ${productionOrderId} está em status ${status} e não aceita registro de consumo.`);
  }
}

/**
 * `RegisterProductionOutput` foi chamado sobre uma ProductionOrder que ainda não está `InProgress` —
 * mesma disciplina de `ProductionConsumptionNotAllowedError`.
 */
export class ProductionOutputNotAllowedError extends ProductionDomainError {
  readonly code = 'PRODUCTION_OUTPUT_NOT_ALLOWED';

  constructor(productionOrderId: string, status: string) {
    super(`ProductionOrder ${productionOrderId} está em status ${status} e não aceita registro de geração.`);
  }
}

/** O `ProductionConsumption` informado é inválido (quantidade ou custo de aquisição não positivos/inválidos). */
export class InvalidProductionConsumptionError extends ProductionDomainError {
  readonly code = 'PRODUCTION_INVALID_CONSUMPTION';

  constructor() {
    super('Registro de consumo inválido — a quantidade consumida deve ser positiva e o custo de aquisição não negativo.');
  }
}

/** O `ProductionOutput` informado é inválido (quantidade gerada não positiva). */
export class InvalidProductionOutputError extends ProductionDomainError {
  readonly code = 'PRODUCTION_INVALID_OUTPUT';

  constructor() {
    super('Registro de geração inválido — a quantidade gerada deve ser positiva.');
  }
}

/**
 * `CompleteProduction` foi chamado sobre uma ProductionOrder sem nenhum `ProductionOutput` já
 * registrado — regra "ProductionCompleted só é publicado após ProductionOutput correspondente já ter
 * sido registrado, nunca a ordem inversa" (`PRODUCTION_HUB.md`, Capítulo 11).
 */
export class ProductionOrderHasNoOutputCannotCompleteError extends ProductionDomainError {
  readonly code = 'PRODUCTION_ORDER_HAS_NO_OUTPUT_CANNOT_COMPLETE';

  constructor(productionOrderId: string) {
    super(`ProductionOrder ${productionOrderId} ainda não possui nenhuma geração registrada e não pode ser concluída.`);
  }
}

/**
 * `CancelProduction` foi chamado sobre uma ProductionOrder que já possui ao menos um
 * `ProductionConsumption` registrado — regra "Um Production Order só é cancelável antes de qualquer
 * ProductionConsumption já registrado — após consumo de insumo, cancelamento exige reversão explícita
 * de estoque" (`PRODUCTION_HUB.md`, Capítulo 11/ADR-PD-004).
 */
export class ProductionOrderHasConsumptionCannotCancelError extends ProductionDomainError {
  readonly code = 'PRODUCTION_ORDER_HAS_CONSUMPTION_CANNOT_CANCEL';

  constructor(productionOrderId: string) {
    super(`ProductionOrder ${productionOrderId} já possui consumo de insumo registrado e não pode mais ser cancelada.`);
  }
}

/** O nome de um `WorkCenter` é obrigatório e não pode ser vazio. */
export class InvalidWorkCenterNameError extends ProductionDomainError {
  readonly code = 'PRODUCTION_INVALID_WORK_CENTER_NAME';

  constructor() {
    super('Work Center inválido — o nome é obrigatório e não pode ser vazio.');
  }
}
