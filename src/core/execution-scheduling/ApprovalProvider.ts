/**
 * Contrato futuro (Tarefa 08) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um fluxo de aprovação externo
 * (ex.: integração com um sistema de aprovação humana real) — hoje
 * `approveSchedule()`/`rejectSchedule()` só são chamados diretamente
 * pela fachada, sem nenhuma integração externa.
 */
export interface ApprovalProvider {
  requestApproval(scheduleId: string): Promise<boolean>;
}
