import { InventoryFactory, type CreateStockMovementInput } from './InventoryFactory';
import { InventoryValidator } from './InventoryValidator';
import type { StockMovement } from './StockMovement';
import type { StockMovementRepository } from './StockMovementRepository';

/**
 * StockMovementRecordingService — "o único ponto de escrita de Stock Movement, acionado internamente
 * ao consumir PurchaseReceived, ProductionConsumption, ProductionOutput, OrderPaid, ReturnApproved, ou
 * por RegisterStockMovement manual explícito" (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 10). Um dos
 * quatro Services explicitamente nomeados por aquele documento.
 *
 * LIMITE DE DOMÍNIO DOCUMENTADO (per instrução de IMP-401 — "Nunca corrigir silenciosamente"):
 * nenhuma inscrição real em Evento de Purchase Hub/Production Hub/Commerce Hub existe nesta Fase —
 * nenhum desses Hubs publica em um Event Bus real ainda (confirmado por grep completo do monorepo).
 * `record` recebe todo dado de origem como parâmetro explícito do chamador (`InventoryMovementManager`),
 * nunca uma inscrição real — mesma disciplina já usada por `ReorderEvaluationService.evaluate` em
 * `packages/purchase-hub/src/ReorderEvaluationService.ts` diante de uma fonte de evento real ausente.
 * A integração real (consumir `PurchaseReceived` de fato) é trabalho de uma Sprint futura de
 * integração entre Hubs, nunca desta Sprint de Core isolado.
 */
export class StockMovementRecordingService {
  private readonly factory = new InventoryFactory();
  private readonly validator = new InventoryValidator();

  constructor(private readonly repository: StockMovementRepository) {}

  async record(input: CreateStockMovementInput): Promise<StockMovement> {
    this.validator.ensureValidQuantityDelta(input.quantityDelta);
    this.validator.ensureOriginReferenceProvidedWhenRequired(input.origin, input.originReferenceId);

    const movement = this.factory.createStockMovement(input);
    return this.repository.append(movement);
  }

  async listByProduct(productId: string, locationId?: string): Promise<readonly StockMovement[]> {
    return this.repository.findByProduct(productId, locationId);
  }

  async listByOriginReference(originReferenceId: string): Promise<readonly StockMovement[]> {
    return this.repository.findByOriginReference(originReferenceId);
  }
}
