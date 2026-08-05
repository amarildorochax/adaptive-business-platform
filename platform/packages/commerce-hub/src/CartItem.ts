/**
 * CartItem — um item retido dentro de um Cart, per `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 16
 * ("Ciclo de vida de Cart/CartItem").
 *
 * Não incluída na lista de Entidades da Etapa 2 desta Sprint, mas explicitamente exigida pelo
 * Blueprint (Cart e CartItem são citados juntos, no mesmo capítulo, como o mesmo par agregado) —
 * adicionada por necessidade estrutural do próprio Blueprint (ver relatório desta Sprint).
 */
export interface CartItem {
  /** Identificador do CartItem. */
  readonly cartItemId: string;

  /** Cart ao qual este item pertence. */
  readonly cartId: string;

  /** Product deste item. */
  readonly productId: string;

  /** Variant deste item, quando aplicável. */
  readonly variantId?: string;

  /** Quantidade. */
  readonly quantity: number;

  /** Preço unitário capturado no momento da adição — nunca recalculado retroativamente. */
  readonly unitPrice: number;

  /** Momento em que o item foi adicionado. */
  readonly addedAt: Date;
}
