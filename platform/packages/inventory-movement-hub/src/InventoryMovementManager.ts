import { resolveMovementOriginEvent } from './InventoryPolicy';
import type {
  CreateStockAlertRuleInput,
  CreateStockLocationInput,
  CreateStockMovementInput,
  CreateStockReservationInput,
} from './InventoryFactory';
import type { InventoryCommand, InventoryCommandType } from './InventoryCommand';
import type { InventoryEvent, InventoryEventType } from './InventoryEvent';
import type { StockAlertRule } from './StockAlertRule';
import { StockAlertEvaluationService } from './StockAlertEvaluationService';
import type { StockLocation } from './StockLocation';
import { StockLocationService } from './StockLocationService';
import type { StockMovement } from './StockMovement';
import { StockMovementRecordingService } from './StockMovementRecordingService';
import type { StockPosition } from './StockPosition';
import { StockPositionProjectionService } from './StockPositionProjectionService';
import type { StockReservation } from './StockReservation';
import { StockReservationService } from './StockReservationService';

export interface InventoryMovementManagerDependencies {
  readonly movements: StockMovementRecordingService;
  readonly positions: StockPositionProjectionService;
  readonly reservations: StockReservationService;
  readonly alerts: StockAlertEvaluationService;
  readonly locations: StockLocationService;
}

/**
 * Resultado de uma operação de Command do InventoryMovementManager — a Entidade produzida, todo
 * Evento consequente já catalogado em `DOMAIN_EVENT_CATALOG.md`, e o Command que a originou. Mesmo
 * formato de `PurchaseOperationResult`/`SupplierOperationResult` — `events` fica vazio (nunca
 * `undefined`) para `CreateStockLocation`, `CreateStockAlertRule` e `DeactivateStockAlertRule`, os
 * três Commands sem Evento correspondente no catálogo aprovado (ver `InventoryCommand.ts`) — nunca
 * preenchido com um Evento inventado.
 */
export interface InventoryOperationResult<TEntity> {
  readonly result: TEntity;
  readonly command: InventoryCommand;
  readonly events: readonly InventoryEvent[];
}

export interface RegisterStockMovementResult {
  readonly movement: StockMovement;
  readonly position: StockPosition;
}

export interface ConvertReservationToMovementResult {
  readonly reservation: StockReservation;
  readonly movement: StockMovement;
  readonly position: StockPosition;
}

/**
 * InventoryMovementManager — a única fachada pública do Inventory Movement Hub
 * (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 10: "todo Command ... passa exclusivamente por ele; nenhum
 * consumidor externo cria Stock Movement diretamente, mesmo o próprio Commerce Hub"). Orquestra os
 * cinco Services do domínio; nenhum consumidor externo acessa `StockMovementRecordingService`/
 * `StockPositionProjectionService`/`StockReservationService`/`StockAlertEvaluationService`/
 * `StockLocationService` diretamente — mesma disciplina "Manager como única fachada" já aplicada por
 * `SupplierManager`/`PurchaseManager`.
 *
 * DECISÃO DE ORQUESTRAÇÃO (documentada, per instrução de IMP-401 — "Nunca corrigir silenciosamente"):
 * `registerStockMovement` e `convertReservationToMovement` encadeiam três Services em sequência
 * (Movement → Position → Alert) diretamente neste Manager, em vez de dentro de um único Service —
 * diferente do Purchase Hub, onde cada Command mapeava para exatamente um Service. A razão é o
 * próprio desenho do domínio: `INVENTORY_MOVEMENT_HUB.md`, Capítulo 12 ("Fluxo Completo"), descreve
 * textualmente esta cadeia (registro → recálculo de posição → avaliação de alerta) como três
 * responsabilidades sequenciais e independentes entre si, cada uma já nomeada como um Service próprio
 * no Capítulo 10 — mantê-las como três Services distintos e compô-las apenas no Manager preserva Alta
 * Coesão (cada Service continua com responsabilidade única) sem introduzir uma quarta responsabilidade
 * de orquestração dentro de qualquer um dos três. Consistente com `STD-001`,
 * `ADAPTIVE_DEVELOPMENT_STANDARD.md`, Capítulo 5 ("Manager: orquestra Services").
 *
 * Não publica em nenhum Event Bus — `InventoryEvent` é retornado ao chamador, mesmo padrão já
 * documentado em `PurchaseManager.ts`/`SupplierManager.ts`, porque nenhuma implementação real de
 * `EventPublisher` existe ainda nesta plataforma.
 */
export class InventoryMovementManager {
  constructor(private readonly deps: InventoryMovementManagerDependencies) {}

  /**
   * `RegisterStockMovement` — "interno, acionado exclusivamente ao consumir Evento de outro Hub"
   * (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 7). Ainda assim exposto normalmente aqui, como qualquer
   * outro Command — é a fachada única mesmo para Commands de gatilho interno (ver `InventoryCommand.ts`).
   */
  async registerStockMovement(
    input: CreateStockMovementInput,
  ): Promise<InventoryOperationResult<RegisterStockMovementResult>> {
    const movement = await this.deps.movements.record(input);
    const position = await this.deps.positions.recalculate(input.productId, input.locationId);
    const alert = await this.deps.alerts.evaluate(input.productId, position.quantityOnHand, input.locationId);

    return {
      result: { movement, position },
      command: this.command('RegisterStockMovement'),
      events: this.movementEvents(movement, position, alert.triggered ? alert.rule : undefined),
    };
  }

  async createStockReservation(
    input: CreateStockReservationInput,
  ): Promise<InventoryOperationResult<StockReservation>> {
    const reservation = await this.deps.reservations.create(input);

    return {
      result: reservation,
      command: this.command('CreateStockReservation'),
      events: [
        this.event('InventoryReserved', { productId: reservation.productId, locationId: reservation.locationId, reservationId: reservation.reservationId }),
      ],
    };
  }

  async releaseStockReservation(reservationId: string): Promise<InventoryOperationResult<StockReservation>> {
    const reservation = await this.deps.reservations.release(reservationId);

    return {
      result: reservation,
      command: this.command('ReleaseStockReservation'),
      events: [
        this.event('InventoryReleased', { productId: reservation.productId, locationId: reservation.locationId, reservationId: reservation.reservationId }),
      ],
    };
  }

  async convertReservationToMovement(
    reservationId: string,
  ): Promise<InventoryOperationResult<ConvertReservationToMovementResult>> {
    const conversion = await this.deps.reservations.convertToMovement(reservationId);
    const position = await this.deps.positions.recalculate(conversion.movement.productId, conversion.movement.locationId);
    const alert = await this.deps.alerts.evaluate(
      conversion.movement.productId,
      position.quantityOnHand,
      conversion.movement.locationId,
    );

    return {
      result: { reservation: conversion.reservation, movement: conversion.movement, position },
      command: this.command('ConvertReservationToMovement'),
      events: this.movementEvents(conversion.movement, position, alert.triggered ? alert.rule : undefined, true),
    };
  }

  /** `CreateStockLocation` não possui Evento correspondente em `DOMAIN_EVENT_CATALOG.md` — incompletude
   * documentada, `events` retorna vazio, nunca preenchido com um Evento inventado. */
  async createStockLocation(input: CreateStockLocationInput): Promise<InventoryOperationResult<StockLocation>> {
    const location = await this.deps.locations.create(input);

    return { result: location, command: this.command('CreateStockLocation'), events: [] };
  }

  /** `CreateStockAlertRule` não possui Evento correspondente em `DOMAIN_EVENT_CATALOG.md` — mesma
   * incompletude documentada acima. */
  async createStockAlertRule(input: CreateStockAlertRuleInput): Promise<InventoryOperationResult<StockAlertRule>> {
    const rule = await this.deps.alerts.createRule(input);

    return { result: rule, command: this.command('CreateStockAlertRule'), events: [] };
  }

  /** `DeactivateStockAlertRule` não possui Evento correspondente em `DOMAIN_EVENT_CATALOG.md` — mesma
   * incompletude documentada acima. */
  async deactivateStockAlertRule(ruleId: string): Promise<InventoryOperationResult<StockAlertRule>> {
    const rule = await this.deps.alerts.deactivateRule(ruleId);

    return { result: rule, command: this.command('DeactivateStockAlertRule'), events: [] };
  }

  async getStockPosition(productId: string, locationId?: string): Promise<StockPosition | undefined> {
    return this.deps.positions.get(productId, locationId);
  }

  async listStockMovementsByProduct(productId: string, locationId?: string): Promise<readonly StockMovement[]> {
    return this.deps.movements.listByProduct(productId, locationId);
  }

  async listStockMovementsByOriginReference(originReferenceId: string): Promise<readonly StockMovement[]> {
    return this.deps.movements.listByOriginReference(originReferenceId);
  }

  async getStockReservation(reservationId: string): Promise<StockReservation | undefined> {
    return this.deps.reservations.get(reservationId);
  }

  async listStockReservationsByOrder(orderId: string): Promise<readonly StockReservation[]> {
    return this.deps.reservations.listByOrder(orderId);
  }

  async listActiveStockLocations(tenantId: string): Promise<readonly StockLocation[]> {
    return this.deps.locations.listActive(tenantId);
  }

  /**
   * Monta os Eventos consequentes de um `StockMovement` já registrado: o Evento específico de origem
   * (quando existente — ver `resolveMovementOriginEvent`), sempre seguido de `InventoryAdjusted`
   * (`StockPositionProjectionService` é "o único ponto que publica InventoryAdjusted", Capítulo 10),
   * e, quando aplicável, `StockAlertTriggered`. `skipOriginEvent` é usado por
   * `convertReservationToMovement` — o Fluxo Completo (Capítulo 12) nunca associa um Evento de origem
   * a `SaleFulfillment` além de `InventoryAdjusted`.
   */
  private movementEvents(
    movement: StockMovement,
    position: StockPosition,
    triggeredRule: StockAlertRule | undefined,
    skipOriginEvent = false,
  ): InventoryEvent[] {
    const events: InventoryEvent[] = [];
    const originEvent = skipOriginEvent ? undefined : resolveMovementOriginEvent(movement.origin);

    if (originEvent) {
      events.push(this.event(originEvent, { productId: movement.productId, locationId: movement.locationId, movementId: movement.movementId }));
    }

    events.push(this.event('InventoryAdjusted', { productId: position.productId, locationId: position.locationId }));

    if (triggeredRule) {
      events.push(this.event('StockAlertTriggered', { productId: triggeredRule.productId, locationId: triggeredRule.locationId, ruleId: triggeredRule.ruleId }));
    }

    return events;
  }

  private command(type: InventoryCommandType): InventoryCommand {
    return { operationId: crypto.randomUUID(), type, requestedAt: new Date() };
  }

  private event(
    type: InventoryEventType,
    ref: { productId?: string; locationId?: string; movementId?: string; reservationId?: string; ruleId?: string },
  ): InventoryEvent {
    return { eventId: crypto.randomUUID(), type, occurredAt: new Date(), ...ref };
  }
}
