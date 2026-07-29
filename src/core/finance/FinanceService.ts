import type { RevenueRecord } from "./RevenueRecord";
import type { ExpenseRecord } from "./ExpenseRecord";
import type { CashFlowRecord } from "./CashFlowRecord";
import type { FinancialSnapshot } from "./FinancialSnapshot";
import { FinanceStore } from "./FinanceStore";

/** Campos aceitos por `FinanceService.recordRevenue()`. */
export type RevenueInput = Pick<RevenueRecord, "description" | "category" | "amount" | "currency" | "metadata">;

/** Campos aceitos por `FinanceService.recordExpense()`. */
export type ExpenseInput = Pick<ExpenseRecord, "description" | "category" | "amount" | "currency" | "metadata">;

/**
 * Registro, consulta, cálculos e snapshot financeiro (Tarefa 09).
 *
 * Todo cálculo (`getCashFlow()`/`getSnapshot()`) usa exclusivamente os
 * RevenueRecord/ExpenseRecord já armazenados neste módulo — nenhuma
 * dependência de CRM/Campaign/Marketing, direta ou indireta.
 *
 * Stateless em relação a eventos/métricas — isso é responsabilidade de
 * FinanceManager.
 *
 * Dependências: FinanceStore (própria instância).
 *
 * Consumido exclusivamente por FinanceManager.
 */
export class FinanceService {
  private readonly store = new FinanceStore();

  /** Registra uma nova RevenueRecord. */
  recordRevenue(input: RevenueInput): RevenueRecord {
    const record: RevenueRecord = {
      id: crypto.randomUUID(),
      description: input.description,
      category: input.category,
      amount: input.amount,
      currency: input.currency,
      metadata: input.metadata,
      createdAt: new Date(),
    };

    this.store.addRevenue(record);

    return record;
  }

  /** Registra uma nova ExpenseRecord. */
  recordExpense(input: ExpenseInput): ExpenseRecord {
    const record: ExpenseRecord = {
      id: crypto.randomUUID(),
      description: input.description,
      category: input.category,
      amount: input.amount,
      currency: input.currency,
      metadata: input.metadata,
      createdAt: new Date(),
    };

    this.store.addExpense(record);

    return record;
  }

  /** Retorna todas as RevenueRecord já registradas. */
  listRevenue(): RevenueRecord[] {
    return this.store.getAllRevenues();
  }

  /** Retorna todas as ExpenseRecord já registradas. */
  listExpenses(): ExpenseRecord[] {
    return this.store.getAllExpenses();
  }

  /** Calcula o CashFlowRecord corrente a partir de todos os registros já armazenados. */
  getCashFlow(): CashFlowRecord {
    const totalRevenue = this.sumAmounts(this.store.getAllRevenues());
    const totalExpense = this.sumAmounts(this.store.getAllExpenses());

    return {
      date: new Date(),
      totalRevenue,
      totalExpense,
      balance: totalRevenue - totalExpense,
    };
  }

  /** Calcula o FinancialSnapshot corrente a partir de todos os registros já armazenados. */
  getSnapshot(): FinancialSnapshot {
    const totalRevenue = this.sumAmounts(this.store.getAllRevenues());
    const totalExpenses = this.sumAmounts(this.store.getAllExpenses());
    const balance = totalRevenue - totalExpenses;

    return {
      currentBalance: balance,
      totalRevenue,
      totalExpenses,
      netProfit: balance,
      generatedAt: new Date(),
    };
  }

  private sumAmounts(records: Array<{ amount: number }>): number {
    return records.reduce((sum, record) => sum + record.amount, 0);
  }
}
