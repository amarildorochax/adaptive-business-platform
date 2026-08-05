import type { ReorderRule, ReorderRuleRepository } from "@abp/purchase-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromBoolInt, fromMs, orNull, orUndefined, toBoolInt, toMs } from "../../db/sqlUtil.js";

interface Row {
  rule_id: string;
  tenant_id: string;
  product_id: string;
  threshold_quantity: number;
  reorder_quantity: number;
  preferred_supplier_id: string | null;
  active: number;
  created_at: number;
  updated_at: number;
}

/** Implementação real de `ReorderRuleRepository`. Única Entidade do Purchase Hub sem nenhuma tabela filha — sem transação explícita, cada `INSERT`/`UPDATE` já é atômico por natureza do próprio SQLite. */
export class SqliteReorderRuleRepository implements ReorderRuleRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(rule: ReorderRule): Promise<ReorderRule> {
    this.db
      .prepare(
        "INSERT INTO reorder_rules (rule_id, tenant_id, product_id, threshold_quantity, reorder_quantity, preferred_supplier_id, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        rule.ruleId,
        rule.tenantId,
        rule.productId,
        rule.thresholdQuantity,
        rule.reorderQuantity,
        orNull(rule.preferredSupplierId),
        toBoolInt(rule.active),
        toMs(rule.createdAt),
        toMs(rule.updatedAt),
      );
    return rule;
  }

  async update(rule: ReorderRule): Promise<ReorderRule> {
    this.db
      .prepare(
        "UPDATE reorder_rules SET tenant_id = ?, product_id = ?, threshold_quantity = ?, reorder_quantity = ?, preferred_supplier_id = ?, active = ?, created_at = ?, updated_at = ? WHERE rule_id = ?",
      )
      .run(
        rule.tenantId,
        rule.productId,
        rule.thresholdQuantity,
        rule.reorderQuantity,
        orNull(rule.preferredSupplierId),
        toBoolInt(rule.active),
        toMs(rule.createdAt),
        toMs(rule.updatedAt),
        rule.ruleId,
      );
    return rule;
  }

  async findById(ruleId: string): Promise<ReorderRule | undefined> {
    const row = this.db.prepare("SELECT * FROM reorder_rules WHERE rule_id = ?").get(ruleId) as unknown as Row | undefined;
    return row ? toRule(row) : undefined;
  }

  async findActiveByProduct(tenantId: string, productId: string): Promise<readonly ReorderRule[]> {
    const rows = this.db
      .prepare("SELECT * FROM reorder_rules WHERE tenant_id = ? AND product_id = ? AND active = 1")
      .all(tenantId, productId) as unknown as Row[];
    return rows.map(toRule);
  }

  async findAllActive(tenantId: string): Promise<readonly ReorderRule[]> {
    const rows = this.db
      .prepare("SELECT * FROM reorder_rules WHERE tenant_id = ? AND active = 1")
      .all(tenantId) as unknown as Row[];
    return rows.map(toRule);
  }
}

function toRule(row: Row): ReorderRule {
  return {
    ruleId: row.rule_id,
    tenantId: row.tenant_id,
    productId: row.product_id,
    thresholdQuantity: row.threshold_quantity,
    reorderQuantity: row.reorder_quantity,
    preferredSupplierId: orUndefined(row.preferred_supplier_id),
    active: fromBoolInt(row.active),
    createdAt: fromMs(row.created_at),
    updatedAt: fromMs(row.updated_at),
  };
}
