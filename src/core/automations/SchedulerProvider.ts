/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um agendamento automático de
 * `executeRule()` — hoje a execução só ocorre por chamada explícita à
 * fachada.
 */
export interface SchedulerProvider {
  schedule(ruleId: string, at: Date): Promise<void>;
}
