import { computeQuantityAvailable } from './InventoryPolicy';
import { InventoryFactory, type CreateStockReservationInput } from './InventoryFactory';
import { StockReservationNotFoundError } from './InventoryDomainError';
import { InventoryValidator } from './InventoryValidator';
import type { StockMovement } from './StockMovement';
import type { StockMovementRepository } from './StockMovementRepository';
import type { StockPositionRepository } from './StockPositionRepository';
import type { StockReservation } from './StockReservation';
import type { StockReservationRepository } from './StockReservationRepository';

export interface StockReservationConversionResult {
  readonly reservation: StockReservation;
  readonly movement: StockMovement;
}

/**
 * StockReservationService — "encapsula a lógica de reserva temporária, conversão e expiração"
 * (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 10). Um dos quatro Services explicitamente nomeados por
 * aquele documento. `convertToMovement` depende também de `StockMovementRepository` — mesmo padrão de
 * `PurchaseRequisitionService` aceitando `PurchaseOrderRepository` além do seu próprio quando a
 * operação naturalmente atravessa dois Aggregates do mesmo Hub
 * (`packages/purchase-hub/src/PurchaseRequisitionService.ts`).
 *
 * A expiração automática de uma Reservation ("Uma Stock Reservation expirada é automaticamente
 * liberada pelo Automation Engine, consumindo um Trigger temporizado — o Inventory Movement Hub nunca
 * implementa seu próprio agendador interno", Capítulo 11/ADR-IM-004) não é implementada por esta
 * Sprint — nenhum agendador é criado; `release` está disponível para ser invocado externamente
 * (por um futuro consumidor do Trigger do Automation Engine), nunca por um `setTimeout`/cron interno
 * a este pacote.
 */
export class StockReservationService {
  private readonly factory = new InventoryFactory();
  private readonly validator = new InventoryValidator();

  constructor(
    private readonly repository: StockReservationRepository,
    private readonly positionRepository: StockPositionRepository,
    private readonly movementRepository: StockMovementRepository,
  ) {}

  async create(input: CreateStockReservationInput): Promise<StockReservation> {
    const position = await this.positionRepository.findByProduct(input.productId, input.locationId);
    const quantityAvailable = position
      ? computeQuantityAvailable(position.quantityOnHand, position.quantityReserved)
      : 0;

    this.validator.ensureReservationWithinAvailable(input.productId, quantityAvailable, input.quantity);

    const reservation = this.factory.createStockReservation(input);
    return this.repository.create(reservation);
  }

  async release(reservationId: string): Promise<StockReservation> {
    const existing = await this.getOrThrow(reservationId);
    this.validator.ensureReservationStatusTransitionAllowed(existing.status, 'Released');

    return this.repository.update({ ...existing, status: 'Released', updatedAt: new Date() });
  }

  /**
   * "expira ou se converte em Stock Movement de saída, nunca as duas coisas" — cria o `StockMovement`
   * de saída (`origin: SaleFulfillment`, `quantityDelta` negativo) diretamente via `InventoryFactory`,
   * sem passar por `StockMovementRecordingService` (evitar reentrância de Service para Service, mesma
   * disciplina já aplicada por `PurchaseRequisitionService.convertToPurchaseOrder`, que constrói o
   * Purchase Order diretamente via `PurchaseFactory` em vez de invocar `PurchaseOrderService`).
   */
  async convertToMovement(reservationId: string): Promise<StockReservationConversionResult> {
    const existing = await this.getOrThrow(reservationId);
    this.validator.ensureReservationStatusTransitionAllowed(existing.status, 'ConvertedToMovement');

    const movement = await this.movementRepository.append(
      this.factory.createStockMovement({
        tenantId: existing.tenantId,
        productId: existing.productId,
        variantId: existing.variantId,
        locationId: existing.locationId,
        quantityDelta: -existing.quantity,
        origin: 'SaleFulfillment',
        originReferenceId: existing.orderId,
      }),
    );

    const reservation = await this.repository.update({
      ...existing,
      status: 'ConvertedToMovement',
      updatedAt: new Date(),
    });

    return { reservation, movement };
  }

  async get(reservationId: string): Promise<StockReservation | undefined> {
    return this.repository.findById(reservationId);
  }

  async listByOrder(orderId: string): Promise<readonly StockReservation[]> {
    return this.repository.findByOrder(orderId);
  }

  private async getOrThrow(reservationId: string): Promise<StockReservation> {
    const existing = await this.repository.findById(reservationId);

    if (!existing) {
      throw new StockReservationNotFoundError(reservationId);
    }

    return existing;
  }
}
