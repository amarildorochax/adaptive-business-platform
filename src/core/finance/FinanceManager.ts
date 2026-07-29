import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import type { RevenueRecord } from "./RevenueRecord";
import type { ExpenseRecord } from "./ExpenseRecord";
import type { CashFlowRecord } from "./CashFlowRecord";
import type { FinancialSnapshot } from "./FinancialSnapshot";
import { FinanceService, type RevenueInput, type ExpenseInput } from "./FinanceService";
import { FinanceMetrics, type FinanceMetricsSnapshot } from "./FinanceMetrics";

/**
 * Coordena todas as operações financeiras (Tarefa 03) — delega
 * registro/consulta/cálculos/snapshot a FinanceService, registra
 * FinanceMetrics e emite os eventos de ciclo de vida
 * (FINANCE_REVENUE_RECORDED/FINANCE_EXPENSE_RECORDED/
 * FINANCE_SNAPSHOT_UPDATED).
 *
 * Nunca acessa IA, nunca acessa CRM/Campaign/Marketing internamente (e
 * nunca sequer os importa) — apenas coordena FinanceService e a
 * infraestrutura cross-cutting (EventBus, FinanceMetrics). Nenhum
 * cálculo financeiro depende de nenhum desses três módulos — todos os
 * cálculos usam exclusivamente RevenueRecord/ExpenseRecord já
 * registrados neste módulo (ver FinanceService.ts).
 *
 * `FINANCE_SNAPSHOT_UPDATED` é emitido a cada `getSnapshot()` — o
 * snapshot é sempre recalculado sob demanda (nunca armazenado), então
 * cada cálculo é, por definição, uma atualização.
 *
 * Consumido exclusivamente por Finance (fachada).
 */
export class FinanceManager {
  private readonly service = new FinanceService();

  private readonly metrics = new FinanceMetrics();

  /** Registra uma nova RevenueRecord. */
  recordRevenue(input: RevenueInput): RevenueRecord {
    const record = this.service.recordRevenue(input);
    this.metrics.recordMutation();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.FINANCE_REVENUE_RECORDED,
      source: "FinanceManager",
      payload: { id: record.id, category: record.category, amount: record.amount, currency: record.currency },
      createdAt: record.createdAt,
    });

    return record;
  }

  /** Registra uma nova ExpenseRecord. */
  recordExpense(input: ExpenseInput): ExpenseRecord {
    const record = this.service.recordExpense(input);
    this.metrics.recordMutation();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.FINANCE_EXPENSE_RECORDED,
      source: "FinanceManager",
      payload: { id: record.id, category: record.category, amount: record.amount, currency: record.currency },
      createdAt: record.createdAt,
    });

    return record;
  }

  /** Retorna todas as RevenueRecord já registradas. Registra consulta. */
  listRevenue(): RevenueRecord[] {
    this.metrics.recordQuery();
    return this.service.listRevenue();
  }

  /** Retorna todas as ExpenseRecord já registradas. Registra consulta. */
  listExpenses(): ExpenseRecord[] {
    this.metrics.recordQuery();
    return this.service.listExpenses();
  }

  /** Calcula o CashFlowRecord corrente. Registra consulta. */
  getCashFlow(): CashFlowRecord {
    this.metrics.recordQuery();
    return this.service.getCashFlow();
  }

  /** Calcula o FinancialSnapshot corrente. Registra consulta e emite FINANCE_SNAPSHOT_UPDATED. */
  getSnapshot(): FinancialSnapshot {
    this.metrics.recordQuery();
    const snapshot = this.service.getSnapshot();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.FINANCE_SNAPSHOT_UPDATED,
      source: "FinanceManager",
      payload: { currentBalance: snapshot.currentBalance, netProfit: snapshot.netProfit },
      createdAt: snapshot.generatedAt,
    });

    return snapshot;
  }

  /** Métricas agregadas de uso do Finance Intelligence. */
  getMetrics(): FinanceMetricsSnapshot {
    this.metrics.recordQuery();

    return this.metrics.snapshot({
      revenues: this.service.listRevenue().length,
      expenses: this.service.listExpenses().length,
    });
  }
}
