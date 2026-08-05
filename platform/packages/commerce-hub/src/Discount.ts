/**
 * Discount (Commerce) — regra promocional de catálogo (percentual, valor fixo, condição de
 * elegibilidade), aplicável a Product/Category/Cart, per `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 14.
 *
 * **Nunca confundir com `Discount` (Finance Hub, já Official)** — aquele é a redução já aplicada a
 * uma Invoice emitida; este é a regra promocional de catálogo, antes de qualquer Invoice existir.
 * ADR-CM-002. Nenhum tipo de `@abp/finance-hub` é importado por este arquivo.
 */
export type DiscountKind = 'Percentage' | 'FixedAmount';

export interface Discount {
  /** Identificador do Discount. */
  readonly discountId: string;

  /** Tenant ao qual o Discount pertence. */
  readonly tenantId: string;

  /** Nome do Discount. */
  readonly name: string;

  /** Tipo de redução. */
  readonly kind: DiscountKind;

  /** Valor da redução — percentual (0-100) ou valor fixo, conforme `kind`. */
  readonly value: number;

  /** Product ao qual o Discount se aplica, quando restrito a um único Product. */
  readonly appliesToProductId?: string;

  /** Category à qual o Discount se aplica, quando restrito a uma Category. */
  readonly appliesToCategoryId?: string;

  /** Início da janela de vigência. */
  readonly validFrom?: Date;

  /** Fim da janela de vigência. */
  readonly validTo?: Date;

  /** Momento de criação. */
  readonly createdAt: Date;
}
