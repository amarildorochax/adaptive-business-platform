import { PurchaseFactory, type CreateReorderRuleInput } from './PurchaseFactory';
import { ReorderRuleNotFoundError } from './PurchaseDomainError';
import { shouldTriggerReorder } from './PurchasePolicy';
import type { PurchaseRequisition } from './PurchaseRequisition';
import type { PurchaseRequisitionRepository } from './PurchaseRequisitionRepository';
import type { ReorderRule } from './ReorderRule';
import type { ReorderRuleRepository } from './ReorderRuleRepository';

export interface EvaluateReorderRuleResult {
  readonly rule: ReorderRule;
  readonly triggered: boolean;
  readonly requisition?: PurchaseRequisition;
}

/**
 * ReorderEvaluationService — avalia uma Reorder Rule contra uma quantidade em estoque corrente e,
 * quando disparada, é "o único ponto que produz PurchaseRequisitionCreated a partir de
 * ReorderRuleTriggered" (`PURCHASE_HUB.md`, Capítulo 11) — por isso cria a `PurchaseRequisition`
 * resultante diretamente, em vez de apenas sinalizar o disparo para outro Service decidir.
 *
 * LIMITE DE DOMÍNIO: `evaluate` recebe `currentQuantity` como parâmetro explícito do chamador, nunca
 * uma inscrição real em "Stock Position" do Inventory Movement Hub — esse pacote não existe ainda
 * nesta Fase. Detalhado em `ReorderRule.ts` e em `IMP_301_PURCHASE_HUB_CORE_REPORT.md`.
 *
 * `createRule`/`deactivateRule` também vivem aqui, não em um Service próprio — `PURCHASE_HUB.md`,
 * Capítulo 11, nomeia apenas este Service para o Aggregate `ReorderRule` (diferente de `Supplier`,
 * onde a arquitetura já previa Services de apoio distintos e `SupplierService` foi uma
 * complementação natural). Manter todo o ciclo de vida de `ReorderRule` neste único Service — criar,
 * desativar, avaliar — é uma única responsabilidade coerente ("gerenciar Reorder Rules"), documentada
 * em `IMP_301_PURCHASE_HUB_CORE_REPORT.md`.
 */
export class ReorderEvaluationService {
  private readonly factory = new PurchaseFactory();

  constructor(
    private readonly ruleRepository: ReorderRuleRepository,
    private readonly requisitionRepository: PurchaseRequisitionRepository,
  ) {}

  async createRule(input: CreateReorderRuleInput): Promise<ReorderRule> {
    const rule = this.factory.createReorderRule(input);
    return this.ruleRepository.create(rule);
  }

  async deactivateRule(ruleId: string): Promise<ReorderRule> {
    const existing = await this.ruleRepository.findById(ruleId);

    if (!existing) {
      throw new ReorderRuleNotFoundError(ruleId);
    }

    return this.ruleRepository.update({ ...existing, active: false, updatedAt: new Date() });
  }

  async evaluate(ruleId: string, currentQuantity: number): Promise<EvaluateReorderRuleResult> {
    const rule = await this.ruleRepository.findById(ruleId);

    if (!rule) {
      throw new ReorderRuleNotFoundError(ruleId);
    }

    if (!shouldTriggerReorder(rule, currentQuantity)) {
      return { rule, triggered: false };
    }

    const requisition = await this.requisitionRepository.create(
      this.factory.createPurchaseRequisition({
        tenantId: rule.tenantId,
        origin: 'ReorderRule',
        lines: [{ productId: rule.productId, suggestedQuantity: rule.reorderQuantity }],
      }),
    );

    return { rule, triggered: true, requisition };
  }
}
