/**
 * Coupon — uma especialização de Discount (Commerce) resgatável por código, com limite de uso e
 * associação opcional a uma Campaign do Marketing/Growth Hub, per `COMMERCE_HUB_ARCHITECTURE.md`,
 * Capítulo 15. `campaignReferenceId` é sempre uma referência opaca — nunca o tipo `Campaign` de
 * `@abp/growth-hub` (nenhum Business Hub depende de outro).
 */
export interface Coupon {
  /** Identificador do Coupon. */
  readonly couponId: string;

  /** Discount do qual este Coupon é uma especialização. */
  readonly discountId: string;

  /** Código resgatável pelo Cliente. */
  readonly code: string;

  /** Limite de uso, quando aplicável. */
  readonly maxRedemptions?: number;

  /** Contagem de resgates já realizados. */
  readonly redemptionsCount: number;

  /** Campaign (Marketing/Growth Hub) associada, quando aplicável — referência opaca. */
  readonly campaignReferenceId?: string;

  /** Momento de criação. */
  readonly createdAt: Date;
}
