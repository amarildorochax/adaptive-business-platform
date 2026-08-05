import type { BOMLine } from './BOMLine';

/**
 * BillOfMaterials — Aggregate independente do Production Hub (`PRODUCTION_HUB.md`, Capítulo 4).
 * Associada a exatamente um Produto final (`outputProductId`); uma nova versão para o mesmo Produto
 * nunca sobrescreve a anterior — é sempre uma nova instância versionada (ADR-PD-002), preservando
 * rastreabilidade histórica de qual composição originou cada `ProductionOrder` já concluída.
 *
 * `outputProductId`/`BOMLine.inputProductId` referenciam o Commerce Hub por identificador opaco,
 * nunca por tipo importado — mesmo Limite do Domínio já aplicado por `StockMovement.productId`
 * (`packages/inventory-movement-hub/src/StockMovement.ts`).
 */

/** Estado da BillOfMaterials — enum fechado, `PRODUCTION_HUB.md`, Capítulo 5. */
export type BillOfMaterialsStatus = 'Active' | 'Superseded';

export interface BillOfMaterials {
  /** Identificador da BillOfMaterials. */
  readonly billOfMaterialsId: string;

  /** Tenant ao qual a BillOfMaterials pertence — isolamento absoluto entre Empresas. */
  readonly tenantId: string;

  /** Produto final referenciado por identificador opaco (Commerce Hub). */
  readonly outputProductId: string;

  /** Versão — incrementada a cada `SupersedeBillOfMaterials`, nunca reutilizada. */
  readonly version: number;

  /** Insumos necessários — parte interna do Aggregate. */
  readonly lines: readonly BOMLine[];

  /** Estado atual. */
  readonly status: BillOfMaterialsStatus;

  /** Momento de criação desta versão. */
  readonly createdAt: Date;

  /** Momento em que esta versão foi superada por uma nova, quando aplicável. */
  readonly supersededAt?: Date;
}
