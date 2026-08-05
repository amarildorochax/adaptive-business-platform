/**
 * OrderItem — um item confirmado dentro de um Order, per `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 18
 * ("Ciclo de vida completo de Order/Order Item").
 */
export interface OrderItem {
  /** Identificador do OrderItem. */
  readonly orderItemId: string;

  /** Order ao qual este item pertence. */
  readonly orderId: string;

  /** Product deste item. */
  readonly productId: string;

  /** Variant deste item, quando aplicável. */
  readonly variantId?: string;

  /** Quantidade. */
  readonly quantity: number;

  /** Preço unitário confirmado no Checkout — nunca recalculado retroativamente. */
  readonly unitPrice: number;
}
