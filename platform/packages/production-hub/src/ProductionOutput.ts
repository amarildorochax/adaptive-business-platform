/**
 * ProductionOutput — registro imutável de Produto acabado efetivamente gerado por uma
 * `ProductionOrder` (`PRODUCTION_HUB.md`, Capítulo 5), sempre parte interna de
 * `ProductionOrder.outputs` — mesma disciplina de `ProductionConsumption.ts`, nenhum
 * `ProductionOutputRepository` próprio existe.
 *
 * "Pode ser menor que o planejado — perda de processo é um fato registrado, não ocultado" (Capítulo
 * 5/ADR-PD-003) — nenhuma validação força `quantityGenerated` a coincidir com
 * `ProductionOrder.plannedOutputQuantity`.
 */
export interface ProductionOutput {
  /** Identificador do registro de geração. */
  readonly outputId: string;

  /** Production Order ao qual esta geração pertence. */
  readonly productionOrderId: string;

  /** Produto acabado referenciado por identificador opaco (Commerce Hub) — sempre um Produto já
   * cadastrado no Catalog, nunca criado implicitamente (`PRODUCTION_HUB.md`, Capítulo 3). */
  readonly outputProductId: string;

  /** Quantidade efetivamente gerada — pode ser menor que o planejado. */
  readonly quantityGenerated: number;

  /** Momento em que a geração foi registrada. */
  readonly generatedAt: Date;
}

export function isValidProductionOutput(output: Pick<ProductionOutput, 'quantityGenerated'>): boolean {
  return Number.isFinite(output.quantityGenerated) && output.quantityGenerated > 0;
}
