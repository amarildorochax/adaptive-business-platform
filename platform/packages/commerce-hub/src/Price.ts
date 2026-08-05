/**
 * Price — o preço de lista de um Product/Variant, antes de qualquer Discount/Coupon, per
 * `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 13. Nunca inclui imposto final calculado — essa
 * responsabilidade é do Finance Hub (`Tax Record`), aplicada apenas no momento de emissão da
 * Invoice, nunca aqui.
 *
 * `currency` é um código simples (ex.: BRL, USD) — nunca o tipo `Currency` de `@abp/finance-hub`:
 * nenhum Business Hub depende de outro (regra já aplicada em toda Sprint anterior desta série).
 */
export interface Price {
  /** Identificador do Price. */
  readonly priceId: string;

  /** Product ao qual este Price se refere. */
  readonly productId: string;

  /** Variant ao qual este Price se refere, quando o preço é específico de uma variação. */
  readonly variantId?: string;

  /** Valor do preço de lista. */
  readonly amount: number;

  /** Código da moeda (ex.: BRL, USD). */
  readonly currency: string;

  /** Momento de criação. */
  readonly createdAt: Date;
}
