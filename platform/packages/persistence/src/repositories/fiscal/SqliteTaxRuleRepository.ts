import type { TaxClassification, TaxRate, TaxRateType, TaxRule, TaxRuleRepository } from "@abp/fiscal-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, fromMsOrUndefined, orNull, orUndefined, toBoolInt, fromBoolInt, toMs, toMsOrNull } from "../../db/sqlUtil.js";

interface Row {
  tax_rule_id: string;
  tenant_id: string;
  tax_regime_id: string;
  classification_code: string;
  rate_type: string;
  rate_value: number;
  exemption_condition: string | null;
  valid_from: number;
  valid_until: number | null;
  active: number;
  created_at: number;
  updated_at: number;
}

/**
 * `save` é o único método de escrita especificado por `FISCAL_HUB.md`, Capítulo 9 — implementado como
 * upsert, usado tanto para `CreateTaxRule` quanto para `DeactivateTaxRule`
 * (`TaxRuleService`, Core, congelado). Tabela única, sem entidade filha — sem transação explícita.
 *
 * `findApplicable` reproduz exatamente `FiscalPolicy.isTaxRuleApplicable` (Core, congelado) em SQL:
 * `active = 1 AND valid_from <= data AND (valid_until IS NULL OR valid_until >= data)`, filtrado por
 * `tax_regime_id`/`classification_code`. Nenhum critério de desempate adicional é imposto pela
 * arquitetura quando mais de uma regra é elegível — `LIMIT 1` sem `ORDER BY` explícito retorna a
 * primeira correspondência, mesmo comportamento não especificado do Fake em memória
 * (`FakeTaxRuleRepository`, Core), decisão documentada em
 * `IMP_602_FISCAL_PERSISTENCE_REPORT.md`.
 */
export class SqliteTaxRuleRepository implements TaxRuleRepository {
  constructor(private readonly db: DatabaseSync) {}

  async save(rule: TaxRule): Promise<TaxRule> {
    this.db
      .prepare(
        `INSERT INTO tax_rules (
           tax_rule_id, tenant_id, tax_regime_id, classification_code, rate_type, rate_value,
           exemption_condition, valid_from, valid_until, active, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (tax_rule_id) DO UPDATE SET
           tenant_id = excluded.tenant_id,
           tax_regime_id = excluded.tax_regime_id,
           classification_code = excluded.classification_code,
           rate_type = excluded.rate_type,
           rate_value = excluded.rate_value,
           exemption_condition = excluded.exemption_condition,
           valid_from = excluded.valid_from,
           valid_until = excluded.valid_until,
           active = excluded.active,
           created_at = excluded.created_at,
           updated_at = excluded.updated_at`,
      )
      .run(
        rule.taxRuleId,
        rule.tenantId,
        rule.taxRegimeId,
        rule.classification.code,
        rule.rate.type,
        rule.rate.value,
        orNull(rule.exemptionCondition),
        toMs(rule.validFrom),
        toMsOrNull(rule.validUntil),
        toBoolInt(rule.active),
        toMs(rule.createdAt),
        toMs(rule.updatedAt),
      );
    return rule;
  }

  async findById(taxRuleId: string): Promise<TaxRule | undefined> {
    const row = this.db.prepare("SELECT * FROM tax_rules WHERE tax_rule_id = ?").get(taxRuleId) as Row | undefined;
    return row ? toRule(row) : undefined;
  }

  async findApplicable(taxRegimeId: string, classification: TaxClassification, date: Date): Promise<TaxRule | undefined> {
    const dateMs = toMs(date);
    const row = this.db
      .prepare(
        `SELECT * FROM tax_rules
         WHERE tax_regime_id = ? AND classification_code = ? AND active = 1
           AND valid_from <= ? AND (valid_until IS NULL OR valid_until >= ?)
         LIMIT 1`,
      )
      .get(taxRegimeId, classification.code, dateMs, dateMs) as Row | undefined;
    return row ? toRule(row) : undefined;
  }
}

function toRule(row: Row): TaxRule {
  const classification: TaxClassification = { code: row.classification_code };
  const rate: TaxRate = { type: row.rate_type as TaxRateType, value: row.rate_value };

  return {
    taxRuleId: row.tax_rule_id,
    tenantId: row.tenant_id,
    taxRegimeId: row.tax_regime_id,
    classification,
    rate,
    exemptionCondition: orUndefined(row.exemption_condition),
    validFrom: fromMs(row.valid_from),
    validUntil: fromMsOrUndefined(row.valid_until),
    active: fromBoolInt(row.active),
    createdAt: fromMs(row.created_at),
    updatedAt: fromMs(row.updated_at),
  };
}
