/**
 * StockPosition — Aggregate derivado do Inventory Movement Hub (`INVENTORY_MOVEMENT_HUB.md`,
 * Capítulo 4). Nunca escrito diretamente por nenhum Command externo — sua única fonte de verdade é a
 * soma de todo `StockMovement` já registrado para o mesmo `productId`/`locationId`, aplicação direta
 * de "Ledger Before Snapshot" (`ERP_ARCHITECTURE.md`, Capítulo 3), o mesmo padrão já maduro entre
 * `Ledger Entry` e `Balance` no Finance Hub.
 *
 * `quantityAvailable` nunca é um campo próprio editável — sempre recalculado como
 * `quantityOnHand - quantityReserved` (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 5), nunca persistido de
 * forma independente que pudesse divergir do resultado dessa subtração.
 */
export interface StockPosition {
  /** Produto referenciado por identificador opaco (Commerce Hub). */
  readonly productId: string;

  /** Variant referenciado por identificador opaco (Commerce Hub), quando aplicável. */
  readonly variantId?: string;

  /** Localização física, quando aplicável — Capability opcional. */
  readonly locationId?: string;

  /** Soma de todo `StockMovement` já registrado para este Produto/Localização. */
  readonly quantityOnHand: number;

  /** Soma de toda `StockReservation` ativa para este Produto/Localização. */
  readonly quantityReserved: number;

  /** `quantityOnHand - quantityReserved` — nunca negativo por desenho (`PurchasePolicy`-equivalente
   * já impede reserva acima do disponível, ver `InventoryValidator.ensureReservationWithinAvailable`). */
  readonly quantityAvailable: number;

  /** Momento do último recálculo. */
  readonly recalculatedAt: Date;
}
