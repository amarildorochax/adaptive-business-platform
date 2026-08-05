/**
 * StockReservation — Aggregate independente do Inventory Movement Hub (`INVENTORY_MOVEMENT_HUB.md`,
 * Capítulo 4). Representa um comprometimento temporário de quantidade — por exemplo, um `Order` em
 * `Checkout` — que ainda não gerou `StockMovement` de saída definitiva; expira ou se converte em
 * `StockMovement` de saída, nunca as duas coisas (mesma disciplina de máquina de estados fechada já
 * aplicada por `PurchaseRequisitionStatus`).
 *
 * `orderId` referencia o Commerce Hub por identificador opaco, nunca por tipo importado.
 */

/** Estado da Reservation — enum fechado, `INVENTORY_MOVEMENT_HUB.md`, Capítulo 5. */
export type StockReservationStatus = 'Active' | 'Released' | 'ConvertedToMovement';

export interface StockReservation {
  /** Identificador da Reservation. */
  readonly reservationId: string;

  /** Tenant ao qual a Reservation pertence. */
  readonly tenantId: string;

  /** Produto referenciado por identificador opaco (Commerce Hub). */
  readonly productId: string;

  /** Variant referenciado por identificador opaco (Commerce Hub), quando aplicável. */
  readonly variantId?: string;

  /** Localização física, quando aplicável — Capability opcional. */
  readonly locationId?: string;

  /** Quantidade reservada. */
  readonly quantity: number;

  /** Order de origem (Commerce Hub), referenciado por identificador opaco. */
  readonly orderId: string;

  /** Estado atual. */
  readonly status: StockReservationStatus;

  /** Momento de expiração, quando definido — expiração real é responsabilidade do Automation Engine
   * (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 11/ADR-IM-004), nunca de um agendador interno deste Hub. */
  readonly expiresAt?: Date;

  /** Momento de criação. */
  readonly createdAt: Date;

  /** Momento da última alteração. */
  readonly updatedAt: Date;
}
