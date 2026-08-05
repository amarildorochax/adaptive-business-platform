import type { BOMLine } from './BOMLine';
import type { ProductionConsumption } from './ProductionConsumption';
import type { ProductionOutput } from './ProductionOutput';
import type { ProductionStatus } from './ProductionOrder';

/**
 * ProductionPolicy — decisões puras de negócio do Production Hub, nunca lançam exceção (isso é
 * responsabilidade de `ProductionValidator`, que consulta esta Policy antes de decidir se lança um
 * `ProductionDomainError`). Cada função aqui é determinística e livre de efeito colateral, mesma
 * disciplina de `InventoryPolicy`/`PurchasePolicy`.
 */

/**
 * Máquina de estados de `ProductionStatus` (`PRODUCTION_HUB.md`, Capítulo 5/11/12): `Planned` inicia
 * via `StartProduction` bem-sucedido (`InProgress`) ou é cancelável diretamente
 * (`Cancelled`); `InProgress` conclui (`Completed`) ou ainda é cancelável enquanto nenhum consumo
 * tiver sido registrado (`ProductionValidator.ensureCanCancelProduction` aplica essa checagem
 * adicional, não expressável apenas pela máquina de estados); `Completed`/`Cancelled` são estados
 * finais.
 */
export function canTransitionProductionOrderStatus(from: ProductionStatus, to: ProductionStatus): boolean {
  if (from === to) {
    return false;
  }

  switch (from) {
    case 'Planned':
      return to === 'InProgress' || to === 'Cancelled';
    case 'InProgress':
      return to === 'Completed' || to === 'Cancelled';
    case 'Completed':
    case 'Cancelled':
      return false;
  }
}

/**
 * `RegisterProductionConsumption` só é aceito enquanto a ProductionOrder está `InProgress` — consumo
 * nunca é registrado antes de `StartProduction` nem depois de `CompleteProduction`/`CancelProduction`.
 */
export function canRegisterProductionConsumption(status: ProductionStatus): boolean {
  return status === 'InProgress';
}

/** `RegisterProductionOutput` só é aceito enquanto a ProductionOrder está `InProgress` — mesma
 * disciplina de `canRegisterProductionConsumption`. */
export function canRegisterProductionOutput(status: ProductionStatus): boolean {
  return status === 'InProgress';
}

/**
 * `StartProduction` verifica disponibilidade de insumo suficiente para cada `BOMLine` da
 * `BillOfMaterials` referenciada, multiplicada pela quantidade de saída planejada
 * (`PRODUCTION_HUB.md`, Capítulo 11/ADR-PD-004).
 *
 * LIMITE DE DOMÍNIO: `availableQuantities` é recebido como parâmetro explícito do chamador, nunca
 * uma consulta real a `@abp/inventory-movement-hub` — nenhum pacote de domínio importa outro Hub
 * além de `@abp/core`/`@abp/shared` (Capítulo 1.1 de `ADAPTIVE_DEVELOPMENT_STANDARD.md`). Mesmo
 * padrão já aplicado por `ReorderEvaluationService.evaluate` recebendo `currentQuantity` como
 * parâmetro (`packages/purchase-hub/src/ReorderEvaluationService.ts`) — a Query real ao Inventory
 * Movement Hub (`PRODUCTION_HUB.md`, Capítulo 10: "consultando Stock Position ... por Query já
 * exposta") é responsabilidade de uma camada de composição futura (HTTP/integração), fora do escopo
 * de um pacote de domínio Core. Divergência documentada per instrução desta Sprint — "Caso algum
 * Command dependa do estoque, receber os dados como parâmetro. Nunca consultar Inventory Movement."
 */
export function hasSufficientInput(
  lines: readonly Pick<BOMLine, 'inputProductId' | 'quantityPerOutputUnit'>[],
  availableQuantities: ReadonlyMap<string, number>,
  plannedOutputQuantity: number,
): boolean {
  return lines.every((line) => {
    const required = line.quantityPerOutputUnit * plannedOutputQuantity;
    const available = availableQuantities.get(line.inputProductId) ?? 0;
    return available >= required;
  });
}

/**
 * "O Production Hub nunca calcula custo de produção consolidado além do que é diretamente observável
 * (soma do acquisitionCost dos insumos consumidos)" (`PRODUCTION_HUB.md`, Capítulo 3) — a única
 * consolidação de custo permitida a este Hub, usada para compor o payload de `ProductionCompleted`.
 */
export function computeTotalConsumedCost(consumptions: readonly Pick<ProductionConsumption, 'acquisitionCost'>[]): number {
  return consumptions.reduce((sum, consumption) => sum + consumption.acquisitionCost, 0);
}

/** Soma da quantidade efetivamente gerada por uma ProductionOrder — payload de `ProductionCompleted`. */
export function computeTotalGeneratedQuantity(outputs: readonly Pick<ProductionOutput, 'quantityGenerated'>[]): number {
  return outputs.reduce((sum, output) => sum + output.quantityGenerated, 0);
}
