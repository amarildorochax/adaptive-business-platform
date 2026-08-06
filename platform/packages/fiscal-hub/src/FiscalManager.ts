import type { FiscalDocument } from './FiscalDocument';
import type { IssueFiscalDocumentInput, RegisterFiscalObligationInput, RegisterTaxRegimeInput, CreateTaxRuleInput } from './FiscalFactory';
import { FiscalDocumentIssuanceService } from './FiscalDocumentIssuanceService';
import type { FiscalCommand, FiscalCommandType } from './FiscalCommand';
import type { FiscalEvent, FiscalEventType } from './FiscalEvent';
import { FiscalObligationTrackingService, type EvaluateFiscalObligationsResult } from './FiscalObligationTrackingService';
import type { FiscalObligation } from './FiscalObligation';
import { TaxCalculationService, type CalculateTaxInput } from './TaxCalculationService';
import type { TaxCalculation } from './TaxCalculation';
import type { TaxRegime } from './TaxRegime';
import { TaxRegimeService } from './TaxRegimeService';
import type { TaxRule } from './TaxRule';
import { TaxRuleService } from './TaxRuleService';

export interface FiscalManagerDependencies {
  readonly taxRegimes: TaxRegimeService;
  readonly taxRules: TaxRuleService;
  readonly taxCalculation: TaxCalculationService;
  readonly documents: FiscalDocumentIssuanceService;
  readonly obligations: FiscalObligationTrackingService;
}

/**
 * Resultado de uma operação de Command do FiscalManager — a Entidade produzida, todo Evento
 * consequente já catalogado em `DOMAIN_EVENT_CATALOG.md`, e o Command que a originou. Mesmo formato de
 * `ProductionOperationResult`/`InventoryOperationResult`/`PurchaseOperationResult` — `events` fica
 * vazio (nunca `undefined`) para `RegisterTaxRegime`, `DeactivateTaxRule` e
 * `MarkFiscalObligationFulfilled`, os três Commands sem Evento correspondente no catálogo aprovado
 * (ver `FiscalCommand.ts`) — nunca preenchido com um Evento inventado.
 */
export interface FiscalOperationResult<TEntity> {
  readonly result: TEntity;
  readonly command: FiscalCommand;
  readonly events: readonly FiscalEvent[];
}

/**
 * Resultado de `evaluateFiscalObligations` — não é um dos oito Commands aprovados (a avaliação é um
 * mecanismo de orquestração interna/agendada, não uma ação de usuário), portanto nunca carrega um
 * `FiscalCommand`. Mesmo formato de `PurchaseEvaluationResult` (`ReorderEvaluationService`).
 */
export interface FiscalEvaluationResult<TEntity> {
  readonly result: TEntity;
  readonly events: readonly FiscalEvent[];
}

/**
 * FiscalManager — a única fachada pública do Fiscal Hub (`FISCAL_HUB.md`, Capítulo 7: "Todo Command é
 * processado exclusivamente pelo FiscalManager"). Orquestra os cinco Services do domínio; nenhum
 * consumidor externo acessa `TaxRegimeService`/`TaxRuleService`/`TaxCalculationService`/
 * `FiscalDocumentIssuanceService`/`FiscalObligationTrackingService` diretamente — mesma disciplina
 * "Manager como única fachada" já aplicada por `ProductionManager`/`InventoryMovementManager`/
 * `PurchaseManager`/`SupplierManager`.
 *
 * Não publica em nenhum Event Bus — `FiscalEvent` é retornado ao chamador, mesmo padrão já
 * documentado em `ProductionManager.ts`, porque nenhuma implementação real de `EventPublisher` existe
 * ainda nesta plataforma.
 */
export class FiscalManager {
  constructor(private readonly deps: FiscalManagerDependencies) {}

  /**
   * `RegisterTaxRegime` não possui Evento correspondente em `DOMAIN_EVENT_CATALOG.md` — incompletude
   * documentada, `events` retorna vazio, nunca preenchido com um Evento inventado.
   */
  async registerTaxRegime(input: RegisterTaxRegimeInput): Promise<FiscalOperationResult<TaxRegime>> {
    const regime = await this.deps.taxRegimes.register(input);

    return { result: regime, command: this.command('RegisterTaxRegime'), events: [] };
  }

  async createTaxRule(input: CreateTaxRuleInput): Promise<FiscalOperationResult<TaxRule>> {
    const rule = await this.deps.taxRules.create(input);

    return {
      result: rule,
      command: this.command('CreateTaxRule'),
      events: [this.event('TaxRuleCreated', { taxRuleId: rule.taxRuleId })],
    };
  }

  /**
   * `DeactivateTaxRule` não possui Evento correspondente em `DOMAIN_EVENT_CATALOG.md` — mesma
   * incompletude documentada acima.
   */
  async deactivateTaxRule(taxRuleId: string): Promise<FiscalOperationResult<TaxRule>> {
    const rule = await this.deps.taxRules.deactivate(taxRuleId);

    return { result: rule, command: this.command('DeactivateTaxRule'), events: [] };
  }

  async calculateTax(input: CalculateTaxInput): Promise<FiscalOperationResult<TaxCalculation>> {
    const calculation = await this.deps.taxCalculation.calculateTax(input);

    return {
      result: calculation,
      command: this.command('CalculateTax'),
      events: [
        this.event('TaxCalculated', {
          fiscalDocumentLineId: calculation.fiscalDocumentLineId,
          taxRuleId: calculation.taxRuleId,
        }),
      ],
    };
  }

  async issueFiscalDocument(input: IssueFiscalDocumentInput): Promise<FiscalOperationResult<FiscalDocument>> {
    const document = await this.deps.documents.issue(input);

    return {
      result: document,
      command: this.command('IssueFiscalDocument'),
      events: [this.event('FiscalDocumentIssued', { fiscalDocumentId: document.fiscalDocumentId })],
    };
  }

  async cancelFiscalDocument(fiscalDocumentId: string, reason: string): Promise<FiscalOperationResult<FiscalDocument>> {
    const document = await this.deps.documents.cancel(fiscalDocumentId, reason);

    return {
      result: document,
      command: this.command('CancelFiscalDocument'),
      events: [this.event('FiscalDocumentCancelled', { fiscalDocumentId: document.fiscalDocumentId })],
    };
  }

  async registerFiscalObligation(input: RegisterFiscalObligationInput): Promise<FiscalOperationResult<FiscalObligation>> {
    const obligation = await this.deps.obligations.register(input);

    return {
      result: obligation,
      command: this.command('RegisterFiscalObligation'),
      events: [this.event('FiscalObligationRegistered', { fiscalObligationId: obligation.fiscalObligationId })],
    };
  }

  /**
   * `MarkFiscalObligationFulfilled` não possui Evento correspondente em `DOMAIN_EVENT_CATALOG.md`
   * (apenas `FiscalObligationOverdue` é catalogado, nenhum "FiscalObligationFulfilled") — mesma
   * incompletude documentada acima.
   */
  async markFiscalObligationFulfilled(fiscalObligationId: string): Promise<FiscalOperationResult<FiscalObligation>> {
    const obligation = await this.deps.obligations.markFulfilled(fiscalObligationId);

    return { result: obligation, command: this.command('MarkFiscalObligationFulfilled'), events: [] };
  }

  /**
   * Não é um dos oito Commands aprovados (ver `FiscalEvaluationResult`) — mecanismo de orquestração
   * interna/agendada que avalia toda Fiscal Obligation pendente contra a data informada, publicando
   * `FiscalObligationOverdue` para cada uma recém-vencida.
   */
  async evaluateFiscalObligations(asOfDate?: Date): Promise<FiscalEvaluationResult<EvaluateFiscalObligationsResult>> {
    const evaluation = await this.deps.obligations.evaluateOverdue(asOfDate);

    return {
      result: evaluation,
      events: evaluation.overdue.map((obligation) =>
        this.event('FiscalObligationOverdue', { fiscalObligationId: obligation.fiscalObligationId }),
      ),
    };
  }

  async getTaxRegime(tenantId: string): Promise<TaxRegime | undefined> {
    return this.deps.taxRegimes.getByTenant(tenantId);
  }

  async getTaxRule(taxRuleId: string): Promise<TaxRule | undefined> {
    return this.deps.taxRules.getById(taxRuleId);
  }

  async getFiscalDocument(fiscalDocumentId: string): Promise<FiscalDocument | undefined> {
    return this.deps.documents.get(fiscalDocumentId);
  }

  async listFiscalDocumentsByOrigin(orderId: string): Promise<readonly FiscalDocument[]> {
    return this.deps.documents.listByOrigin(orderId);
  }

  async listPendingFiscalObligations(): Promise<readonly FiscalObligation[]> {
    return this.deps.obligations.listPending();
  }

  async listOverdueFiscalObligations(): Promise<readonly FiscalObligation[]> {
    return this.deps.obligations.listOverdue();
  }

  private command(type: FiscalCommandType): FiscalCommand {
    return { operationId: crypto.randomUUID(), type, requestedAt: new Date() };
  }

  private event(
    type: FiscalEventType,
    ref: {
      taxRuleId?: string;
      fiscalDocumentLineId?: string;
      fiscalDocumentId?: string;
      fiscalObligationId?: string;
    },
  ): FiscalEvent {
    return { eventId: crypto.randomUUID(), type, occurredAt: new Date(), ...ref };
  }
}
