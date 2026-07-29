import type { RevenueRecord } from "./RevenueRecord";
import type { ExpenseRecord } from "./ExpenseRecord";
import type { CashFlowRecord } from "./CashFlowRecord";
import type { FinancialSnapshot } from "./FinancialSnapshot";
import { FinanceManager } from "./FinanceManager";
import type { RevenueInput, ExpenseInput } from "./FinanceService";
import type { FinanceMetricsSnapshot } from "./FinanceMetrics";

/**
 * Fachada pública única do Finance Intelligence (Tarefa 02) — a fonte
 * oficial de dados financeiros da plataforma.
 *
 * ```
 * Application
 *    ↓
 * Finance.recordRevenue/recordExpense/listRevenue/listExpenses/
 *         getCashFlow/getSnapshot/getMetrics          ← única fachada
 *    ↓
 * FinanceManager     ← coordena; nunca acessa IA/CRM/Campaign/Marketing
 *    ↓
 * FinanceService      ← registro, consulta, cálculos, snapshot
 *    ↓
 * FinanceStore
 *    ↓
 * RevenueRecord · ExpenseRecord
 *    (CashFlowRecord/FinancialSnapshot são sempre calculados, nunca
 *     armazenados — ver notas em CashFlowRecord.ts/FinancialSnapshot.ts)
 * ```
 *
 * Não executa pagamentos, não integra bancos, não emite nota fiscal,
 * não integra contabilidade, não usa automações, não usa IA, não
 * envia notificações — apenas o domínio responsável pelos dados
 * financeiros, em memória (sem persistência).
 *
 * Este módulo não consome CRM, Campaign nem Marketing (nenhum dos três
 * foi alterado nesta Sprint) — todo cálculo usa exclusivamente
 * RevenueRecord/ExpenseRecord já registrados aqui.
 *
 * Responsabilidade: nenhum consumidor deve importar FinanceManager,
 * FinanceService ou FinanceStore diretamente — todos usam
 * exclusivamente esta fachada.
 *
 * Dependências: FinanceManager.
 */
export class Finance {
  private readonly manager = new FinanceManager();

  /** Registra uma nova RevenueRecord. */
  recordRevenue(input: RevenueInput): RevenueRecord {
    return this.manager.recordRevenue(input);
  }

  /** Registra uma nova ExpenseRecord. */
  recordExpense(input: ExpenseInput): ExpenseRecord {
    return this.manager.recordExpense(input);
  }

  /** Retorna todas as RevenueRecord já registradas. */
  listRevenue(): RevenueRecord[] {
    return this.manager.listRevenue();
  }

  /** Retorna todas as ExpenseRecord já registradas. */
  listExpenses(): ExpenseRecord[] {
    return this.manager.listExpenses();
  }

  /** Calcula o CashFlowRecord corrente. */
  getCashFlow(): CashFlowRecord {
    return this.manager.getCashFlow();
  }

  /** Calcula o FinancialSnapshot corrente. */
  getSnapshot(): FinancialSnapshot {
    return this.manager.getSnapshot();
  }

  /** Métricas agregadas de uso do Finance Intelligence. */
  getMetrics(): FinanceMetricsSnapshot {
    return this.manager.getMetrics();
  }
}

/** Instância única e compartilhada do Finance para toda a plataforma. */
export const finance = new Finance();
