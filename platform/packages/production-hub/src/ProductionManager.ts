import type { BillOfMaterials } from './BillOfMaterials';
import { BillOfMaterialsService, type SupersedeBillOfMaterialsInput, type SupersedeBillOfMaterialsResult } from './BillOfMaterialsService';
import type {
  CreateBillOfMaterialsInput,
  CreateProductionOrderInput,
  CreateWorkCenterInput,
  RegisterProductionConsumptionInput,
  RegisterProductionOutputInput,
} from './ProductionFactory';
import type { ProductionCommand, ProductionCommandType } from './ProductionCommand';
import type { ProductionEvent, ProductionEventType } from './ProductionEvent';
import {
  ProductionExecutionService,
  type RegisterProductionConsumptionResult,
  type RegisterProductionOutputResult,
  type StartProductionResult,
} from './ProductionExecutionService';
import type { ProductionOrder, ProductionStatus } from './ProductionOrder';
import type { WorkCenter } from './WorkCenter';
import { WorkCenterService } from './WorkCenterService';

export interface ProductionManagerDependencies {
  readonly billsOfMaterials: BillOfMaterialsService;
  readonly execution: ProductionExecutionService;
  readonly workCenters: WorkCenterService;
}

/**
 * Resultado de uma operação de Command do ProductionManager — a Entidade produzida, todo Evento
 * consequente já catalogado em `DOMAIN_EVENT_CATALOG.md`, e o Command que a originou. Mesmo formato de
 * `InventoryOperationResult`/`PurchaseOperationResult`/`SupplierOperationResult` — `events` fica vazio
 * (nunca `undefined`) para `CreateProductionOrder` e `CreateWorkCenter`, os dois Commands sem Evento
 * correspondente no catálogo aprovado (ver `ProductionCommand.ts`) — nunca preenchido com um Evento
 * inventado.
 */
export interface ProductionOperationResult<TEntity> {
  readonly result: TEntity;
  readonly command: ProductionCommand;
  readonly events: readonly ProductionEvent[];
}

/**
 * ProductionManager — a única fachada pública do Production Hub (`PRODUCTION_HUB.md`, Capítulo 10:
 * "todo Command ... passa exclusivamente por ele"). Orquestra os três Services do domínio; nenhum
 * consumidor externo acessa `BillOfMaterialsService`/`ProductionExecutionService`/`WorkCenterService`
 * diretamente — mesma disciplina "Manager como única fachada" já aplicada por
 * `SupplierManager`/`PurchaseManager`/`InventoryMovementManager`.
 *
 * Não publica em nenhum Event Bus — `ProductionEvent` é retornado ao chamador, mesmo padrão já
 * documentado em `InventoryMovementManager.ts`, porque nenhuma implementação real de `EventPublisher`
 * existe ainda nesta plataforma.
 */
export class ProductionManager {
  constructor(private readonly deps: ProductionManagerDependencies) {}

  async createBillOfMaterials(input: CreateBillOfMaterialsInput): Promise<ProductionOperationResult<BillOfMaterials>> {
    const bom = await this.deps.billsOfMaterials.create(input);

    return {
      result: bom,
      command: this.command('CreateBillOfMaterials'),
      events: [this.event('BillOfMaterialsCreated', { billOfMaterialsId: bom.billOfMaterialsId })],
    };
  }

  async supersedeBillOfMaterials(
    billOfMaterialsId: string,
    input: SupersedeBillOfMaterialsInput,
  ): Promise<ProductionOperationResult<SupersedeBillOfMaterialsResult>> {
    const result = await this.deps.billsOfMaterials.supersede(billOfMaterialsId, input);

    return {
      result,
      command: this.command('SupersedeBillOfMaterials'),
      events: [
        this.event('BillOfMaterialsSuperseded', {
          billOfMaterialsId: result.next.billOfMaterialsId,
          previousBillOfMaterialsId: result.previous.billOfMaterialsId,
        }),
      ],
    };
  }

  /**
   * `CreateProductionOrder` não possui Evento correspondente em `DOMAIN_EVENT_CATALOG.md` —
   * incompletude documentada, `events` retorna vazio, nunca preenchido com um Evento inventado.
   */
  async createProductionOrder(input: CreateProductionOrderInput): Promise<ProductionOperationResult<ProductionOrder>> {
    const order = await this.deps.execution.create(input);

    return { result: order, command: this.command('CreateProductionOrder'), events: [] };
  }

  /**
   * `ProductionStarted` só é publicado quando `started: true` — insumo insuficiente resulta em
   * `events: []`, nunca um Evento publicado silenciosamente para uma transição que não ocorreu (ver
   * `ProductionExecutionService.start`).
   */
  async startProduction(
    productionOrderId: string,
    availableQuantities: ReadonlyMap<string, number>,
  ): Promise<ProductionOperationResult<StartProductionResult>> {
    const result = await this.deps.execution.start(productionOrderId, availableQuantities);

    return {
      result,
      command: this.command('StartProduction'),
      events: result.started
        ? [this.event('ProductionStarted', { productionOrderId: result.productionOrder.productionOrderId })]
        : [],
    };
  }

  async registerProductionConsumption(
    productionOrderId: string,
    input: RegisterProductionConsumptionInput,
  ): Promise<ProductionOperationResult<RegisterProductionConsumptionResult>> {
    const result = await this.deps.execution.registerConsumption(productionOrderId, input);

    return {
      result,
      command: this.command('RegisterProductionConsumption'),
      events: [
        this.event('ProductionConsumption', {
          productionOrderId,
          inputProductId: result.consumption.inputProductId,
        }),
      ],
    };
  }

  async registerProductionOutput(
    productionOrderId: string,
    input: RegisterProductionOutputInput,
  ): Promise<ProductionOperationResult<RegisterProductionOutputResult>> {
    const result = await this.deps.execution.registerOutput(productionOrderId, input);

    return {
      result,
      command: this.command('RegisterProductionOutput'),
      events: [
        this.event('ProductionOutput', {
          productionOrderId,
          outputProductId: result.output.outputProductId,
        }),
      ],
    };
  }

  /** "ProductionCompleted só é publicado após ProductionOutput correspondente já ter sido registrado"
   * (`PRODUCTION_HUB.md`, Capítulo 11) — garantido por `ProductionExecutionService.complete`. */
  async completeProduction(productionOrderId: string): Promise<ProductionOperationResult<ProductionOrder>> {
    const order = await this.deps.execution.complete(productionOrderId);

    return {
      result: order,
      command: this.command('CompleteProduction'),
      events: [this.event('ProductionCompleted', { productionOrderId: order.productionOrderId })],
    };
  }

  async cancelProduction(productionOrderId: string, reason: string): Promise<ProductionOperationResult<ProductionOrder>> {
    const order = await this.deps.execution.cancel(productionOrderId, reason);

    return {
      result: order,
      command: this.command('CancelProduction'),
      events: [this.event('ProductionCancelled', { productionOrderId: order.productionOrderId })],
    };
  }

  /**
   * `CreateWorkCenter` não possui Evento correspondente em `DOMAIN_EVENT_CATALOG.md` — mesma
   * incompletude documentada acima.
   */
  async createWorkCenter(input: CreateWorkCenterInput): Promise<ProductionOperationResult<WorkCenter>> {
    const workCenter = await this.deps.workCenters.create(input);

    return { result: workCenter, command: this.command('CreateWorkCenter'), events: [] };
  }

  async getBillOfMaterials(billOfMaterialsId: string): Promise<BillOfMaterials | undefined> {
    return this.deps.billsOfMaterials.getById(billOfMaterialsId);
  }

  async getActiveBillOfMaterialsForProduct(outputProductId: string): Promise<BillOfMaterials | undefined> {
    return this.deps.billsOfMaterials.getActiveForProduct(outputProductId);
  }

  async getProductionOrder(productionOrderId: string): Promise<ProductionOrder | undefined> {
    return this.deps.execution.get(productionOrderId);
  }

  async listProductionOrdersByStatus(status: ProductionStatus): Promise<readonly ProductionOrder[]> {
    return this.deps.execution.listByStatus(status);
  }

  async listProductionOrdersByOrigin(orderId: string): Promise<readonly ProductionOrder[]> {
    return this.deps.execution.listByOrigin(orderId);
  }

  async getTotalConsumedCost(productionOrderId: string): Promise<number> {
    return this.deps.execution.getTotalConsumedCost(productionOrderId);
  }

  async getTotalGeneratedQuantity(productionOrderId: string): Promise<number> {
    return this.deps.execution.getTotalGeneratedQuantity(productionOrderId);
  }

  async listActiveWorkCenters(): Promise<readonly WorkCenter[]> {
    return this.deps.workCenters.listActive();
  }

  private command(type: ProductionCommandType): ProductionCommand {
    return { operationId: crypto.randomUUID(), type, requestedAt: new Date() };
  }

  private event(
    type: ProductionEventType,
    ref: {
      billOfMaterialsId?: string;
      previousBillOfMaterialsId?: string;
      productionOrderId?: string;
      workCenterId?: string;
      inputProductId?: string;
      outputProductId?: string;
    },
  ): ProductionEvent {
    return { eventId: crypto.randomUUID(), type, occurredAt: new Date(), ...ref };
  }
}
