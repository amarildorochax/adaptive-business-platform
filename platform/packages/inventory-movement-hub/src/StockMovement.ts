import type { MovementOrigin } from './MovementOrigin';
import type { QuantityDelta } from './QuantityDelta';

/**
 * StockMovement — Aggregate Root do Inventory Movement Hub (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 4).
 * Cada instância é um fato físico único e imutável — nunca editado ou removido após criação, apenas
 * compensado por um novo `StockMovement` de sinal oposto quando uma correção é necessária
 * (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 11). Por isso `StockMovementRepository` expõe apenas
 * `append`, nunca `update` — reforçado já no próprio nome do contrato (Capítulo 9).
 *
 * `productId`/`variantId` referenciam o Commerce Hub por identificador opaco, nunca por tipo
 * importado — mesmo Limite do Domínio já aplicado por `PurchaseOrderItem.productId`
 * (`packages/purchase-hub/src/PurchaseOrderItem.ts`).
 */
export interface StockMovement {
  /** Identificador do Movement. */
  readonly movementId: string;

  /** Tenant ao qual o Movement pertence — isolamento absoluto entre Empresas. */
  readonly tenantId: string;

  /** Produto referenciado por identificador opaco (Commerce Hub). */
  readonly productId: string;

  /** Variant referenciado por identificador opaco (Commerce Hub), quando aplicável. */
  readonly variantId?: string;

  /** Localização física, quando a Empresa opera mais de um ponto físico de estoque — Capability
   * opcional (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 11); ausência implica localização única padrão. */
  readonly locationId?: string;

  /** Quantidade assinada — positiva para entrada, negativa para saída. */
  readonly quantityDelta: QuantityDelta;

  /** Origem fechada do Movement. */
  readonly origin: MovementOrigin;

  /** Identificador do Purchase Order/Production Order/Order de origem, quando aplicável — sempre
   * presente para `ProductionConsumption`/`ProductionOutput` (ver `MovementOrigin.ts`). */
  readonly originReferenceId?: string;

  /** Momento em que o fato físico ocorreu. */
  readonly occurredAt: Date;
}
