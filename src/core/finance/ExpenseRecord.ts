/**
 * Despesa registrada — entidade central de saída financeira (Tarefa
 * 05). Mesmo formato de RevenueRecord, entidade distinta (nunca
 * compartilham armazenamento — ver FinanceStore.ts).
 */
export interface ExpenseRecord {
  id: string;

  description: string;

  category: string;

  amount: number;

  currency: string;

  createdAt: Date;

  metadata: Record<string, unknown>;
}
