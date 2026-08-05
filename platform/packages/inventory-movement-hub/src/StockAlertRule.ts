/**
 * StockAlertRule — Aggregate independente do Inventory Movement Hub (`INVENTORY_MOVEMENT_HUB.md`,
 * Capítulo 4). Limiar que, quando cruzado, publica `StockAlertTriggered`, consumido por Purchase Hub
 * (candidato a `ReorderRuleTriggered`) e Automation Engine (Capítulo 13).
 */
export interface StockAlertRule {
  /** Identificador da Regra. */
  readonly ruleId: string;

  /** Tenant ao qual a Regra pertence. */
  readonly tenantId: string;

  /** Produto referenciado por identificador opaco (Commerce Hub). */
  readonly productId: string;

  /** Variant referenciado por identificador opaco (Commerce Hub), quando aplicável. */
  readonly variantId?: string;

  /** Localização física, quando aplicável — Capability opcional. */
  readonly locationId?: string;

  /** Quantidade em estoque abaixo (ou igual a) da qual a Regra é disparada. */
  readonly thresholdQuantity: number;

  /** Regras inativas nunca são avaliadas por `StockAlertEvaluationService`. */
  readonly active: boolean;

  /** Momento de criação. */
  readonly createdAt: Date;

  /** Momento da última alteração. */
  readonly updatedAt: Date;
}
