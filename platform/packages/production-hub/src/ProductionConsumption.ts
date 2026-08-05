/**
 * ProductionConsumption — registro imutável de insumo efetivamente consumido em uma `ProductionOrder`
 * (`PRODUCTION_HUB.md`, Capítulo 5), sempre parte interna de `ProductionOrder.consumptions` — "Production
 * Order ... agrupa Production Consumption e Production Output como parte interna" (Capítulo 4). Por
 * isso nenhum `ProductionConsumptionRepository` existe (ver `ProductionOrderRepository.ts`, Capítulo
 * 9 da arquitetura só especifica três Repository Interfaces, nenhuma própria para este registro).
 *
 * "Pode divergir da BOM Line planejada, registrado como está, nunca forçado a coincidir" (Capítulo 5)
 * — nenhuma validação compara `quantityConsumed` à `BOMLine.quantityPerOutputUnit` correspondente.
 *
 * DIVERGÊNCIA DOCUMENTADA (per instrução desta Sprint — "Nunca corrigir silenciosamente"):
 * `PRODUCTION_HUB.md`, Capítulo 5, não lista `acquisitionCost` entre os campos desta Entidade, mas
 * `DOMAIN_EVENT_CATALOG.md` especifica literalmente "acquisitionCost de origem" no payload conceitual
 * do Evento `ProductionConsumption`, e o Evento `ProductionCompleted` exige "custo total consumido"
 * (Capítulo 3: "soma do acquisitionCost dos insumos consumidos" é a única consolidação de custo
 * permitida a este Hub) — uma soma que só é computável se cada registro carregar seu próprio custo.
 * Esta Sprint resolve a lacuna adicionando `acquisitionCost` como campo próprio da Entidade,
 * recebido como parâmetro explícito de `RegisterProductionConsumption` (nunca consultado a outro Hub
 * — ver nota de limite de domínio em `ProductionExecutionService.ts`). Tratado como valor total já
 * observado para a quantidade consumida nesta linha (não um custo unitário), consistente com a
 * leitura literal de "soma do acquisitionCost dos insumos consumidos".
 */
export interface ProductionConsumption {
  /** Identificador do registro de consumo. */
  readonly consumptionId: string;

  /** Production Order ao qual este consumo pertence. */
  readonly productionOrderId: string;

  /** Insumo referenciado por identificador opaco (Commerce Hub). */
  readonly inputProductId: string;

  /** Quantidade efetivamente consumida — pode divergir do planejado pela BOM Line. */
  readonly quantityConsumed: number;

  /** Custo de aquisição observado para a quantidade consumida nesta linha — ver nota de divergência
   * acima. Nunca calculado internamente; sempre recebido como parâmetro do chamador. */
  readonly acquisitionCost: number;

  /** Momento em que o consumo foi registrado. */
  readonly consumedAt: Date;
}

export function isValidProductionConsumption(
  consumption: Pick<ProductionConsumption, 'quantityConsumed' | 'acquisitionCost'>,
): boolean {
  return (
    Number.isFinite(consumption.quantityConsumed) &&
    consumption.quantityConsumed > 0 &&
    Number.isFinite(consumption.acquisitionCost) &&
    consumption.acquisitionCost >= 0
  );
}
