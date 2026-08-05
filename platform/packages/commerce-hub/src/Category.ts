/**
 * Category — organiza Product hierarquicamente, per `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 11.
 * Nomeada `Category` (Commerce) para evitar qualquer colisão com `Category` (Content Hub, já própria
 * daquele Bounded Context, distinta por natureza: uma organiza produto, a outra organiza conteúdo
 * editorial) — mesma disciplina de nomenclatura já usada por `ContentTag` (Content Hub) para evitar
 * colisão com `Tag` (CRM Hub).
 *
 * Não incluída na lista de Entidades da Etapa 2 desta Sprint, mas explicitamente exigida pelo fluxo
 * já descrito no Blueprint (Capítulo 9: "Product criado → associado a Category → publicado no
 * Catalog") — adicionada por necessidade estrutural do próprio Blueprint, não por iniciativa
 * desta Sprint (ver relatório desta Sprint).
 */
export interface Category {
  /** Identificador da Category. */
  readonly categoryId: string;

  /** Tenant ao qual a Category pertence. */
  readonly tenantId: string;

  /** Nome da Category. */
  readonly name: string;

  /** Category-pai, quando hierárquica. */
  readonly parentCategoryId?: string;

  /** Momento de criação. */
  readonly createdAt: Date;
}
