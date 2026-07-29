import type { RevenueRecord } from "./RevenueRecord";
import type { ExpenseRecord } from "./ExpenseRecord";

/**
 * Armazenamento de RevenueRecord/ExpenseRecord — exclusivamente em
 * memória (`Map`), indexado por `id` (Tarefa 08). Sem persistência, sem
 * banco — mesmo padrão já usado por CustomerStore/CampaignStore.
 *
 * CashFlowRecord/FinancialSnapshot não têm armazenamento aqui — são
 * sempre calculados sob demanda por FinanceService a partir dos
 * registros deste Store (ver notas em CashFlowRecord.ts/
 * FinancialSnapshot.ts).
 *
 * Responsabilidade: guardar e recuperar por identificador — nenhuma
 * regra de negócio/cálculo (isso é responsabilidade de FinanceService)
 * e nenhuma emissão de evento (isso é responsabilidade de
 * FinanceManager).
 *
 * Consumido exclusivamente por FinanceService.
 */
export class FinanceStore {
  private revenues = new Map<string, RevenueRecord>();

  private expenses = new Map<string, ExpenseRecord>();

  /** Adiciona um novo RevenueRecord. */
  addRevenue(record: RevenueRecord): void {
    this.revenues.set(record.id, record);
  }

  /** Retorna todos os RevenueRecord já registrados. */
  getAllRevenues(): RevenueRecord[] {
    return Array.from(this.revenues.values());
  }

  /** Adiciona um novo ExpenseRecord. */
  addExpense(record: ExpenseRecord): void {
    this.expenses.set(record.id, record);
  }

  /** Retorna todos os ExpenseRecord já registrados. */
  getAllExpenses(): ExpenseRecord[] {
    return Array.from(this.expenses.values());
  }

  /** Remove todos os registros (receitas e despesas). */
  clear(): void {
    this.revenues.clear();
    this.expenses.clear();
  }
}
