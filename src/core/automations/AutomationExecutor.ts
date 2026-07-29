/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um executor real de
 * AutomationRule — esta Sprint nunca executa nada de fato
 * (`Automation.executeRule()` é sempre conceitual).
 */
export interface AutomationExecutor {
  execute(ruleId: string): Promise<void>;
}
