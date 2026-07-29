/**
 * Retrato financeiro consolidado (Tarefa 07) — sempre calculado sob
 * demanda por `FinanceService.getSnapshot()`; nunca armazenado por
 * FinanceStore (mesmo princípio de CashFlowRecord).
 *
 * Nota de simplificação: `currentBalance` e `netProfit` têm hoje o
 * mesmo valor (`totalRevenue - totalExpenses`) — Finance não modela
 * saldo inicial/período contábil nesta Sprint, então não há, ainda,
 * distinção real entre "saldo corrente" e "lucro líquido do período".
 * Os dois campos permanecem separados na interface (conforme pedido),
 * prontos para divergirem quando essa distinção for modelada.
 */
export interface FinancialSnapshot {
  currentBalance: number;

  totalRevenue: number;

  totalExpenses: number;

  netProfit: number;

  generatedAt: Date;
}
