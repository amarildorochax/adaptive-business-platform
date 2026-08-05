import type { ApprovalThreshold } from './ApprovalThreshold';
import type { Money } from './Money';
import type {
  CreatePurchaseOrderInput,
  CreatePurchaseOrderItemInput,
  CreatePurchaseRequisitionInput,
  CreateReceivingInput,
  CreateReorderRuleInput,
} from './PurchaseFactory';
import type { PurchaseCommand, PurchaseCommandType } from './PurchaseCommand';
import type { PurchaseEvent, PurchaseEventType } from './PurchaseEvent';
import type { PurchaseOrder } from './PurchaseOrder';
import { PurchaseOrderService } from './PurchaseOrderService';
import type { PurchaseRequisition, PurchaseRequisitionStatus } from './PurchaseRequisition';
import { PurchaseRequisitionService } from './PurchaseRequisitionService';
import type { Receiving } from './Receiving';
import { ReceivingService, type RegisterReceivingResult } from './ReceivingService';
import { ReorderEvaluationService, type EvaluateReorderRuleResult } from './ReorderEvaluationService';
import type { ReorderRule } from './ReorderRule';

export interface PurchaseManagerDependencies {
  readonly orders: PurchaseOrderService;
  readonly receiving: ReceivingService;
  readonly requisitions: PurchaseRequisitionService;
  readonly reorder: ReorderEvaluationService;
}

/**
 * Resultado de uma operação de Command do PurchaseManager — a Entidade produzida, todo Evento
 * consequente já catalogado em `DOMAIN_EVENT_CATALOG.md`, e o Command que a originou. Mesmo formato
 * de `SupplierOperationResult` (`packages/supplier-hub/src/SupplierManager.ts`) — `events` fica
 * vazio (nunca `undefined`) para `AddPurchaseOrderItem`, `RejectPurchaseRequisition`,
 * `CreateReorderRule` e `DeactivateReorderRule`, os quatro Commands sem Evento correspondente no
 * catálogo aprovado (ver `PurchaseCommand.ts`) — nunca preenchido com um Evento inventado.
 */
export interface PurchaseOperationResult<TEntity> {
  readonly result: TEntity;
  readonly command: PurchaseCommand;
  readonly events: readonly PurchaseEvent[];
}

/**
 * Resultado de `evaluateReorderRule` — não é um dos doze Commands aprovados por
 * `PURCHASE_HUB.md`, Capítulo 7 (a avaliação é um mecanismo de orquestração interna/agendada, não
 * uma ação de usuário), portanto nunca carrega um `PurchaseCommand`. Ainda assim produz Eventos reais
 * (`ReorderRuleTriggered`, e `PurchaseRequisitionCreated` quando aplicável), documentado em
 * `IMP_301_PURCHASE_HUB_CORE_REPORT.md`.
 */
export interface PurchaseEvaluationResult<TEntity> {
  readonly result: TEntity;
  readonly events: readonly PurchaseEvent[];
}

/**
 * PurchaseManager — a única fachada pública do Purchase Hub (`PURCHASE_HUB.md`, Capítulo 11).
 * Orquestra os quatro Services do domínio; nenhum consumidor externo acessa `PurchaseOrderService`/
 * `ReceivingService`/`PurchaseRequisitionService`/`ReorderEvaluationService` diretamente — mesma
 * disciplina "Manager como única fachada" já aplicada por `SupplierManager`.
 *
 * Não publica em nenhum Event Bus — `PurchaseEvent` é retornado ao chamador, mesmo padrão já
 * documentado em `SupplierManager.ts`, porque nenhuma implementação real de `EventPublisher` existe
 * ainda nesta plataforma.
 */
export class PurchaseManager {
  constructor(private readonly deps: PurchaseManagerDependencies) {}

  async createPurchaseOrder(input: CreatePurchaseOrderInput): Promise<PurchaseOperationResult<PurchaseOrder>> {
    const purchaseOrder = await this.deps.orders.create(input);
    return {
      result: purchaseOrder,
      command: this.command('CreatePurchaseOrder'),
      events: [this.event('PurchaseCreated', { purchaseOrderId: purchaseOrder.purchaseOrderId })],
    };
  }

  /**
   * `AddPurchaseOrderItem` não possui Evento correspondente em `DOMAIN_EVENT_CATALOG.md` —
   * incompletude documentada, `events` retorna vazio, nunca preenchido com um Evento inventado.
   */
  async addPurchaseOrderItem(
    purchaseOrderId: string,
    input: Omit<CreatePurchaseOrderItemInput, 'purchaseOrderId'>,
  ): Promise<PurchaseOperationResult<PurchaseOrder>> {
    const purchaseOrder = await this.deps.orders.addItem(purchaseOrderId, input);
    return {
      result: purchaseOrder,
      command: this.command('AddPurchaseOrderItem'),
      events: [],
    };
  }

  async approvePurchaseOrder(
    purchaseOrderId: string,
    threshold: ApprovalThreshold,
    approvedByIdentityId?: string,
  ): Promise<PurchaseOperationResult<PurchaseOrder>> {
    const purchaseOrder = await this.deps.orders.approve(purchaseOrderId, threshold, approvedByIdentityId);
    return {
      result: purchaseOrder,
      command: this.command('ApprovePurchaseOrder'),
      events: [this.event('PurchaseApproved', { purchaseOrderId: purchaseOrder.purchaseOrderId })],
    };
  }

  async sendPurchaseOrderToSupplier(purchaseOrderId: string): Promise<PurchaseOperationResult<PurchaseOrder>> {
    const purchaseOrder = await this.deps.orders.sendToSupplier(purchaseOrderId);
    return {
      result: purchaseOrder,
      command: this.command('SendPurchaseOrderToSupplier'),
      events: [this.event('PurchaseSentToSupplier', { purchaseOrderId: purchaseOrder.purchaseOrderId })],
    };
  }

  async registerReceiving(input: CreateReceivingInput): Promise<PurchaseOperationResult<RegisterReceivingResult>> {
    const registration = await this.deps.receiving.register(input);
    const type: PurchaseEventType = registration.fullyReceived ? 'PurchaseReceived' : 'PurchasePartiallyReceived';

    return {
      result: registration,
      command: this.command('RegisterReceiving'),
      events: [this.event(type, { purchaseOrderId: registration.purchaseOrder.purchaseOrderId })],
    };
  }

  async cancelPurchaseOrder(purchaseOrderId: string): Promise<PurchaseOperationResult<PurchaseOrder>> {
    const purchaseOrder = await this.deps.orders.cancel(purchaseOrderId);
    return {
      result: purchaseOrder,
      command: this.command('CancelPurchaseOrder'),
      events: [this.event('PurchaseCancelled', { purchaseOrderId: purchaseOrder.purchaseOrderId })],
    };
  }

  async createPurchaseRequisition(
    input: CreatePurchaseRequisitionInput,
  ): Promise<PurchaseOperationResult<PurchaseRequisition>> {
    const requisition = await this.deps.requisitions.create(input);
    return {
      result: requisition,
      command: this.command('CreatePurchaseRequisition'),
      events: [this.event('PurchaseRequisitionCreated', { requisitionId: requisition.requisitionId })],
    };
  }

  async approvePurchaseRequisition(requisitionId: string): Promise<PurchaseOperationResult<PurchaseRequisition>> {
    const requisition = await this.deps.requisitions.approve(requisitionId);
    return {
      result: requisition,
      command: this.command('ApprovePurchaseRequisition'),
      events: [this.event('PurchaseRequisitionApproved', { requisitionId: requisition.requisitionId })],
    };
  }

  /**
   * `RejectPurchaseRequisition` não possui Evento correspondente em `DOMAIN_EVENT_CATALOG.md` —
   * mesma incompletude documentada acima.
   */
  async rejectPurchaseRequisition(requisitionId: string): Promise<PurchaseOperationResult<PurchaseRequisition>> {
    const requisition = await this.deps.requisitions.reject(requisitionId);
    return {
      result: requisition,
      command: this.command('RejectPurchaseRequisition'),
      events: [],
    };
  }

  async convertRequisitionToPurchaseOrder(
    requisitionId: string,
    supplierId: string,
    acquisitionCosts: ReadonlyMap<string, Money>,
  ): Promise<PurchaseOperationResult<{ readonly requisition: PurchaseRequisition; readonly purchaseOrder: PurchaseOrder }>> {
    const conversion = await this.deps.requisitions.convertToPurchaseOrder(requisitionId, supplierId, acquisitionCosts);
    return {
      result: conversion,
      command: this.command('ConvertRequisitionToPurchaseOrder'),
      events: [this.event('PurchaseCreated', { purchaseOrderId: conversion.purchaseOrder.purchaseOrderId })],
    };
  }

  /**
   * `CreateReorderRule` não possui Evento correspondente em `DOMAIN_EVENT_CATALOG.md` — mesma
   * incompletude documentada acima.
   */
  async createReorderRule(input: CreateReorderRuleInput): Promise<PurchaseOperationResult<ReorderRule>> {
    const rule = await this.deps.reorder.createRule(input);
    return {
      result: rule,
      command: this.command('CreateReorderRule'),
      events: [],
    };
  }

  /**
   * `DeactivateReorderRule` não possui Evento correspondente em `DOMAIN_EVENT_CATALOG.md` — mesma
   * incompletude documentada acima.
   */
  async deactivateReorderRule(ruleId: string): Promise<PurchaseOperationResult<ReorderRule>> {
    const rule = await this.deps.reorder.deactivateRule(ruleId);
    return {
      result: rule,
      command: this.command('DeactivateReorderRule'),
      events: [],
    };
  }

  /**
   * Não é um dos doze Commands aprovados (ver `PurchaseEvaluationResult`) — mecanismo de
   * orquestração interna/agendada que avalia uma Reorder Rule contra a quantidade em estoque
   * corrente informada pelo chamador (limite de domínio documentado em `ReorderRule.ts`).
   */
  async evaluateReorderRule(
    ruleId: string,
    currentQuantity: number,
  ): Promise<PurchaseEvaluationResult<EvaluateReorderRuleResult>> {
    const evaluation = await this.deps.reorder.evaluate(ruleId, currentQuantity);

    if (!evaluation.triggered || !evaluation.requisition) {
      return { result: evaluation, events: [] };
    }

    return {
      result: evaluation,
      events: [
        this.event('ReorderRuleTriggered', { ruleId: evaluation.rule.ruleId }),
        this.event('PurchaseRequisitionCreated', { requisitionId: evaluation.requisition.requisitionId }),
      ],
    };
  }

  async getPurchaseOrder(purchaseOrderId: string): Promise<PurchaseOrder | undefined> {
    return this.deps.orders.get(purchaseOrderId);
  }

  async listOpenPurchaseOrders(tenantId: string): Promise<readonly PurchaseOrder[]> {
    return this.deps.orders.listOpen(tenantId);
  }

  async listPurchaseOrdersBySupplier(supplierId: string): Promise<readonly PurchaseOrder[]> {
    return this.deps.orders.listBySupplier(supplierId);
  }

  async getPurchaseRequisition(requisitionId: string): Promise<PurchaseRequisition | undefined> {
    return this.deps.requisitions.get(requisitionId);
  }

  async listPurchaseRequisitionsByStatus(
    tenantId: string,
    status: PurchaseRequisitionStatus,
  ): Promise<readonly PurchaseRequisition[]> {
    return this.deps.requisitions.listByStatus(tenantId, status);
  }

  async listReceivingsByPurchaseOrder(purchaseOrderId: string): Promise<readonly Receiving[]> {
    return this.deps.receiving.listByPurchaseOrder(purchaseOrderId);
  }

  private command(type: PurchaseCommandType): PurchaseCommand {
    return { operationId: crypto.randomUUID(), type, requestedAt: new Date() };
  }

  private event(
    type: PurchaseEventType,
    ref: { purchaseOrderId?: string; requisitionId?: string; ruleId?: string },
  ): PurchaseEvent {
    return { eventId: crypto.randomUUID(), type, occurredAt: new Date(), ...ref };
  }
}
