/**
 * Inventory — garante que um Product/Variant vendido tenha disponibilidade real, per
 * `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 25. Nunca ajustado por nenhum Hub além do Commerce Hub —
 * nem mesmo o Finance Hub, mesmo quando um Refund está associado a uma devolução física.
 *
 * `StockMovement` (Blueprint, mesmo Capítulo) — o registro histórico de cada movimentação — não foi
 * implementado como Entidade própria nesta Sprint; `Inventory` já emite `StockUpdated` a cada ajuste
 * (ver `CommerceManager.adjustInventory`), suficiente para o nível de domínio exigido pela Etapa 6
 * ("administrar estoque apenas em nível de domínio"). Um ledger histórico completo é adiado — ver
 * relatório desta Sprint, "Componentes Ausentes".
 */
export interface Inventory {
  /** Identificador do Inventory. */
  readonly inventoryId: string;

  /** Product ao qual este registro de estoque se refere. */
  readonly productId: string;

  /** Variant ao qual este registro de estoque se refere, quando aplicável. */
  readonly variantId?: string;

  /** Quantidade disponível. */
  readonly quantity: number;

  /** Momento do último ajuste. */
  readonly updatedAt: Date;
}
