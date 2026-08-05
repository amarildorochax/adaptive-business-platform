/**
 * Variant — uma combinação específica de atributo de um Product (tamanho, cor), cada uma com seu
 * próprio Price e Inventory — nunca um Product novo e independente, sempre subordinada ao Product
 * original, per `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 12.
 *
 * Nota de nomenclatura: o texto de exemplo desta Sprint (Etapa 2/3) usa "ProductVariant"; o Blueprint
 * (Capítulo 37.1, tabela de Ownership) usa exclusivamente "Variant" — esta Sprint segue o vocabulário
 * já aprovado, tratando o texto de exemplo como ilustrativo, mesmo padrão já aplicado em toda Sprint
 * anterior desta série.
 */
export interface Variant {
  /** Identificador do Variant. */
  readonly variantId: string;

  /** Product ao qual este Variant pertence. */
  readonly productId: string;

  /** Rótulo do Variant (ex.: "Tamanho M / Azul"). */
  readonly label: string;

  /** Momento de criação. */
  readonly createdAt: Date;
}
