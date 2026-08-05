import type { StockAlertRule, StockAlertRuleRepository } from "@abp/inventory-movement-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromBoolInt, fromMs, orNull, orUndefined, toBoolInt, toMs } from "../../db/sqlUtil.js";

interface Row {
  rule_id: string;
  tenant_id: string;
  product_id: string;
  variant_id: string | null;
  location_id: string | null;
  threshold_quantity: number;
  active: number;
  created_at: number;
  updated_at: number;
}

/**
 * Implementação real de `StockAlertRuleRepository`. Sem tabela filha — sem transação explícita, mesmo
 * critério de `SqliteReorderRuleRepository` (IMP-302). `findActiveByProduct` retorna `undefined`
 * (nunca `null`) quando nenhuma Regra ativa existe — mesma convenção já usada em toda a plataforma
 * (documentada como alinhamento deliberado em `IMP_401_INVENTORY_MOVEMENT_HUB_CORE_REPORT.md`, Seção
 * 11.3, frente ao `| null` do pseudocódigo de `INVENTORY_MOVEMENT_HUB.md`, Capítulo 9).
 */
export class SqliteStockAlertRuleRepository implements StockAlertRuleRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(rule: StockAlertRule): Promise<StockAlertRule> {
    this.db
      .prepare(
        "INSERT INTO stock_alert_rules (rule_id, tenant_id, product_id, variant_id, location_id, threshold_quantity, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        rule.ruleId,
        rule.tenantId,
        rule.productId,
        orNull(rule.variantId),
        orNull(rule.locationId),
        rule.thresholdQuantity,
        toBoolInt(rule.active),
        toMs(rule.createdAt),
        toMs(rule.updatedAt),
      );
    return rule;
  }

  async update(rule: StockAlertRule): Promise<StockAlertRule> {
    this.db
      .prepare(
        "UPDATE stock_alert_rules SET tenant_id = ?, product_id = ?, variant_id = ?, location_id = ?, threshold_quantity = ?, active = ?, created_at = ?, updated_at = ? WHERE rule_id = ?",
      )
      .run(
        rule.tenantId,
        rule.productId,
        orNull(rule.variantId),
        orNull(rule.locationId),
        rule.thresholdQuantity,
        toBoolInt(rule.active),
        toMs(rule.createdAt),
        toMs(rule.updatedAt),
        rule.ruleId,
      );
    return rule;
  }

  async findById(ruleId: string): Promise<StockAlertRule | undefined> {
    const row = this.db.prepare("SELECT * FROM stock_alert_rules WHERE rule_id = ?").get(ruleId) as unknown as Row | undefined;
    return row ? toRule(row) : undefined;
  }

  async findActiveByProduct(productId: string, locationId?: string): Promise<StockAlertRule | undefined> {
    const row = (
      locationId === undefined
        ? this.db.prepare("SELECT * FROM stock_alert_rules WHERE product_id = ? AND active = 1 LIMIT 1").get(productId)
        : this.db
            .prepare("SELECT * FROM stock_alert_rules WHERE product_id = ? AND location_id = ? AND active = 1 LIMIT 1")
            .get(productId, locationId)
    ) as unknown as Row | undefined;

    return row ? toRule(row) : undefined;
  }
}

function toRule(row: Row): StockAlertRule {
  return {
    ruleId: row.rule_id,
    tenantId: row.tenant_id,
    productId: row.product_id,
    variantId: orUndefined(row.variant_id),
    locationId: orUndefined(row.location_id),
    thresholdQuantity: row.threshold_quantity,
    active: fromBoolInt(row.active),
    createdAt: fromMs(row.created_at),
    updatedAt: fromMs(row.updated_at),
  };
}
