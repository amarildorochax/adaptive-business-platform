import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import { automation } from "@/core/automations/Automation";
import type { AutomationRule } from "@/core/automations/AutomationRule";
import { businessIntelligence } from "./BusinessIntelligence";
import type { Recommendation } from "./Recommendation";
import {
  BusinessIntelligenceAutomationMetrics,
  type BusinessIntelligenceAutomationMetricsSnapshot,
} from "./BusinessIntelligenceAutomationMetrics";

/** `Recommendation.priority` mapeada para `AutomationRule.priority` (número — maior significa mais prioritário). */
function toRulePriority(priority: Recommendation["priority"]): number {
  switch (priority) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
  }
}

/**
 * Ponte entre Business Intelligence e Automation Center (Sprint 20,
 * Tarefa 01) — transforma cada Recommendation já gerada
 * (`@/core/business-intelligence`, Sprint 19) em uma AutomationRule
 * **candidata**, sempre desabilitada.
 *
 * Consulta exclusivamente `businessIntelligence.listRecommendations()`
 * e `automation.createRule()`/`createTrigger()`/`createAction()`
 * (Tarefa 02) — todos métodos públicos já existentes de suas
 * respectivas fachadas (`createTrigger()`/`createAction()` foram
 * adicionados à fachada `Automation` na própria Sprint 14, além do
 * mínimo pedido lá, exatamente para que `AutomationRule.triggerId`/
 * `actionIds` — campos obrigatórios — tivessem de onde vir; sem eles,
 * `automation.createRule()` sozinho não seria suficiente). Nunca
 * `AutomationManager`/`AutomationService`/`AutomationStore`/
 * `BusinessIntelligenceManager`/`BusinessIntelligenceService`/
 * `BusinessIntelligenceStore`, nunca nenhuma entidade interna além das
 * já públicas (`Recommendation`, `AutomationRule`, `AutomationTrigger`,
 * `AutomationAction`).
 *
 * **Nenhuma regra é executada automaticamente** (REGRA): `sync()` nunca
 * chama `automation.enableRule()`/`executeRule()` — apenas
 * `createRule()`, que por construção já sempre cria a regra com
 * `enabled: false` (`AutomationService.createRule()`, Sprint 14, nunca
 * aceita `enabled` como campo de entrada). A Tarefa 03 ("criar apenas
 * regras desabilitadas") é, portanto, satisfeita estruturalmente — não
 * há nenhum caminho para criar uma regra já habilitada através desta
 * ponte.
 *
 * `metadata.origin`/`recommendationId`/`generatedAt` (Tarefa 04)
 * marcam a proveniência de cada AutomationRule candidata gerada aqui —
 * único jeito de distinguir, mais tarde, uma regra criada
 * automaticamente por esta ponte de uma criada manualmente.
 *
 * `sync()` é idempotente entre chamadas: mantém, em memória, o
 * conjunto de `recommendationId` já convertidos — uma Recommendation
 * já processada em uma sincronização anterior é pulada
 * (`skippedRecommendations`), nunca gerando uma segunda AutomationRule
 * duplicada.
 */
export class BusinessIntelligenceAutomationProvider {
  private readonly metrics = new BusinessIntelligenceAutomationMetrics();

  private readonly processedRecommendationIds = new Set<string>();

  /**
   * Sincroniza: para cada Recommendation ainda não convertida, cria um
   * AutomationTrigger, uma AutomationAction e uma AutomationRule
   * (sempre desabilitada) associados. Retorna apenas as AutomationRule
   * criadas nesta chamada (recomendações já processadas antes não
   * geram nada novo).
   */
  sync(): AutomationRule[] {
    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.BI_AUTOMATION_SYNC_STARTED,
      source: "BusinessIntelligenceAutomationProvider",
      payload: {},
      createdAt: new Date(),
    });

    const recommendations = businessIntelligence.listRecommendations();
    const generatedRules: AutomationRule[] = [];

    for (const recommendation of recommendations) {
      this.metrics.recordRecommendationProcessed();

      if (this.processedRecommendationIds.has(recommendation.id)) {
        this.metrics.recordSkipped();
        continue;
      }

      const rule = this.convertToRule(recommendation);
      this.processedRecommendationIds.add(recommendation.id);
      this.metrics.recordRuleGenerated();
      generatedRules.push(rule);
    }

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.BI_AUTOMATION_SYNC_COMPLETED,
      source: "BusinessIntelligenceAutomationProvider",
      payload: {
        recommendationsProcessed: recommendations.length,
        rulesGenerated: generatedRules.length,
      },
      createdAt: new Date(),
    });

    return generatedRules;
  }

  /** Métricas agregadas de uso do BusinessIntelligenceAutomationProvider. */
  getMetrics(): BusinessIntelligenceAutomationMetricsSnapshot {
    return this.metrics.snapshot();
  }

  private convertToRule(recommendation: Recommendation): AutomationRule {
    const trigger = automation.createTrigger({
      eventType: "BI_RECOMMENDATION_GENERATED",
      conditions: { recommendationId: recommendation.id, priority: recommendation.priority },
    });

    const action = automation.createAction({
      type: "review",
      target: recommendation.title,
      parameters: { description: recommendation.description, insightId: recommendation.insightId },
    });

    return automation.createRule({
      name: `[BI] ${recommendation.title}`,
      description: recommendation.description,
      triggerId: trigger.id,
      actionIds: [action.id],
      priority: toRulePriority(recommendation.priority),
      metadata: {
        origin: "business-intelligence",
        recommendationId: recommendation.id,
        generatedAt: new Date(),
      },
    });
  }
}

/** Instância única e compartilhada do BusinessIntelligenceAutomationProvider para toda a plataforma. */
export const businessIntelligenceAutomationProvider = new BusinessIntelligenceAutomationProvider();
