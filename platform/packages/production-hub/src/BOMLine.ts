import type { UnitOfMeasure } from './UnitOfMeasure';

/**
 * BOMLine — quantidade de um insumo necessária para produzir uma unidade de saída de uma
 * `BillOfMaterials`, Value Object imutável, sempre parte interna de `BillOfMaterials.lines`
 * (`PRODUCTION_HUB.md`, Capítulo 5) — nunca referenciado por identificador próprio fora do Aggregate
 * que a contém, mesma disciplina de `ReceivingLine`
 * (`packages/purchase-hub/src/ReceivingLine.ts`).
 *
 * `inputProductId`/`variantId` referenciam o Commerce Hub por identificador opaco, nunca por tipo
 * importado — "todo insumo referencia, por identificador, um Produto ou Variant já cadastrado"
 * (`PRODUCTION_HUB.md`, Capítulo 3).
 */
export interface BOMLine {
  /** Produto insumo referenciado por identificador opaco (Commerce Hub). */
  readonly inputProductId: string;

  /** Variant do insumo referenciado por identificador opaco (Commerce Hub), quando aplicável. */
  readonly variantId?: string;

  /** Quantidade de insumo necessária por unidade de saída. */
  readonly quantityPerOutputUnit: number;

  /** Unidade de medida desta linha. */
  readonly unitOfMeasure: UnitOfMeasure;
}

export function isValidBOMLine(line: Pick<BOMLine, 'quantityPerOutputUnit'>): boolean {
  return Number.isFinite(line.quantityPerOutputUnit) && line.quantityPerOutputUnit > 0;
}
