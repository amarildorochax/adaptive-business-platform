import type { BillOfMaterialsRepository } from './BillOfMaterialsRepository';
import { BillOfMaterialsNotFoundError, ProductionOrderNotFoundError } from './ProductionDomainError';
import { computeTotalConsumedCost, computeTotalGeneratedQuantity, hasSufficientInput } from './ProductionPolicy';
import type { ProductionConsumption } from './ProductionConsumption';
import {
  ProductionFactory,
  type CreateProductionOrderInput,
  type RegisterProductionConsumptionInput,
  type RegisterProductionOutputInput,
} from './ProductionFactory';
import type { ProductionOrder, ProductionStatus } from './ProductionOrder';
import type { ProductionOrderRepository } from './ProductionOrderRepository';
import type { ProductionOutput } from './ProductionOutput';
import { ProductionValidator } from './ProductionValidator';

export interface StartProductionResult {
  readonly productionOrder: ProductionOrder;
  readonly started: boolean;
}

export interface RegisterProductionConsumptionResult {
  readonly productionOrder: ProductionOrder;
  readonly consumption: ProductionConsumption;
}

export interface RegisterProductionOutputResult {
  readonly productionOrder: ProductionOrder;
  readonly output: ProductionOutput;
}

/**
 * ProductionExecutionService — "o único ponto que valida disponibilidade de insumo ... antes de
 * StartProduction, e que publica ProductionConsumption/ProductionOutput/ProductionCompleted"
 * (`PRODUCTION_HUB.md`, Capítulo 10). Um dos dois Services explicitamente nomeados por aquele
 * documento — orquestra todo o ciclo de vida de `ProductionOrder` (criação, início, consumo, geração,
 * conclusão, cancelamento), mesma disciplina de `PurchaseOrderService` combinada com `ReceivingService`
 * em um único Service coerente, já que `PRODUCTION_HUB.md` nomeia apenas um Service para todo o
 * Aggregate `ProductionOrder` (diferente de Purchase Hub, que nomeia `PurchaseOrderService` e
 * `ReceivingService` separadamente para dois Aggregates distintos — `ProductionConsumption`/
 * `ProductionOutput` nunca são Aggregates próprios aqui, ver `ProductionConsumption.ts`).
 */
export class ProductionExecutionService {
  private readonly factory = new ProductionFactory();
  private readonly validator = new ProductionValidator();

  constructor(
    private readonly repository: ProductionOrderRepository,
    private readonly billOfMaterialsRepository: BillOfMaterialsRepository,
  ) {}

  async create(input: CreateProductionOrderInput): Promise<ProductionOrder> {
    this.validator.ensureValidPlannedOutputQuantity(input.plannedOutputQuantity);

    const bom = await this.billOfMaterialsRepository.findById(input.billOfMaterialsId);

    if (!bom) {
      throw new BillOfMaterialsNotFoundError(input.billOfMaterialsId);
    }

    this.validator.ensureBillOfMaterialsActive(bom.billOfMaterialsId, bom.status);

    const order = this.factory.createProductionOrder(input);
    return this.repository.save(order);
  }

  /**
   * "StartProduction verifica disponibilidade de insumo suficiente ... antes de transicionar para
   * InProgress — insumo insuficiente resulta em ProductionOrder permanecendo Planned, nunca iniciada
   * silenciosamente com déficit" (`PRODUCTION_HUB.md`, Capítulo 11/ADR-PD-004) — insumo insuficiente
   * nunca lança um Domain Error, é um resultado válido de negócio (`started: false`), mesma leitura já
   * aplicada por `ReorderEvaluationService.evaluate` retornando `triggered: false` sem lançar exceção
   * quando a Regra não dispara.
   *
   * `availableQuantities` — ver nota de Limite de Domínio em `ProductionPolicy.hasSufficientInput`.
   */
  async start(
    productionOrderId: string,
    availableQuantities: ReadonlyMap<string, number>,
  ): Promise<StartProductionResult> {
    const existing = await this.getOrThrow(productionOrderId);
    this.validator.ensureProductionOrderStatusTransitionAllowed(existing.status, 'InProgress');

    const bom = await this.billOfMaterialsRepository.findById(existing.billOfMaterialsId);

    if (!bom) {
      throw new BillOfMaterialsNotFoundError(existing.billOfMaterialsId);
    }

    if (!hasSufficientInput(bom.lines, availableQuantities, existing.plannedOutputQuantity)) {
      return { productionOrder: existing, started: false };
    }

    const started = await this.repository.save({
      ...existing,
      status: 'InProgress',
      startedAt: new Date(),
      updatedAt: new Date(),
    });

    return { productionOrder: started, started: true };
  }

  async registerConsumption(
    productionOrderId: string,
    input: RegisterProductionConsumptionInput,
  ): Promise<RegisterProductionConsumptionResult> {
    const existing = await this.getOrThrow(productionOrderId);
    this.validator.ensureCanRegisterConsumption(productionOrderId, existing.status);

    const consumption = this.factory.createProductionConsumption(productionOrderId, input);
    this.validator.ensureValidProductionConsumption(consumption);

    const productionOrder = await this.repository.save({
      ...existing,
      consumptions: [...existing.consumptions, consumption],
      updatedAt: new Date(),
    });

    return { productionOrder, consumption };
  }

  async registerOutput(
    productionOrderId: string,
    input: RegisterProductionOutputInput,
  ): Promise<RegisterProductionOutputResult> {
    const existing = await this.getOrThrow(productionOrderId);
    this.validator.ensureCanRegisterOutput(productionOrderId, existing.status);

    const output = this.factory.createProductionOutput(productionOrderId, input);
    this.validator.ensureValidProductionOutput(output);

    const productionOrder = await this.repository.save({
      ...existing,
      outputs: [...existing.outputs, output],
      updatedAt: new Date(),
    });

    return { productionOrder, output };
  }

  async complete(productionOrderId: string): Promise<ProductionOrder> {
    const existing = await this.getOrThrow(productionOrderId);
    this.validator.ensureCanCompleteProduction(productionOrderId, existing.status, existing.outputs.length);

    return this.repository.save({
      ...existing,
      status: 'Completed',
      completedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async cancel(productionOrderId: string, reason: string): Promise<ProductionOrder> {
    const existing = await this.getOrThrow(productionOrderId);
    this.validator.ensureCanCancelProduction(productionOrderId, existing.status, existing.consumptions.length);

    return this.repository.save({
      ...existing,
      status: 'Cancelled',
      cancelReason: reason,
      updatedAt: new Date(),
    });
  }

  /** "Soma do acquisitionCost dos insumos consumidos" (`PRODUCTION_HUB.md`, Capítulo 3) — única
   * consolidação de custo permitida a este Hub. */
  async getTotalConsumedCost(productionOrderId: string): Promise<number> {
    const existing = await this.getOrThrow(productionOrderId);
    return computeTotalConsumedCost(existing.consumptions);
  }

  async getTotalGeneratedQuantity(productionOrderId: string): Promise<number> {
    const existing = await this.getOrThrow(productionOrderId);
    return computeTotalGeneratedQuantity(existing.outputs);
  }

  async get(productionOrderId: string): Promise<ProductionOrder | undefined> {
    return this.repository.findById(productionOrderId);
  }

  async listByStatus(status: ProductionStatus): Promise<readonly ProductionOrder[]> {
    return this.repository.findByStatus(status);
  }

  async listByOrigin(orderId: string): Promise<readonly ProductionOrder[]> {
    return this.repository.findByOrigin(orderId);
  }

  private async getOrThrow(productionOrderId: string): Promise<ProductionOrder> {
    const existing = await this.repository.findById(productionOrderId);

    if (!existing) {
      throw new ProductionOrderNotFoundError(productionOrderId);
    }

    return existing;
  }
}
