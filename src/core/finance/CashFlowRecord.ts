/**
 * Retrato de fluxo de caixa (Tarefa 06) — sempre calculado sob demanda
 * por `FinanceService.getCashFlow()` a partir de todos os
 * RevenueRecord/ExpenseRecord já registrados; nunca armazenado por
 * FinanceStore (não é uma entidade com CRUD própria, ver
 * FinanceStore.ts).
 */
export interface CashFlowRecord {
  date: Date;

  totalRevenue: number;

  totalExpense: number;

  balance: number;
}
