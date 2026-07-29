/**
 * Contrato futuro (Tarefa 08) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um agendador real de
 * ExecutionSchedule — hoje nenhum agendamento é de fato disparado.
 *
 * Nota de nomenclatura: mesmo nome de `@/core/automations/
 * SchedulerProvider.ts` (Sprint 14, também um contrato futuro nunca
 * implementado, formato de método distinto) — intencional, pedido
 * assim pela Tarefa 08 desta Sprint. Colide no barrel de topo
 * (`core/index.ts`), resolvido excluindo `./execution-scheduling` de
 * lá (ver nota em ExecutionScheduling.ts) — dentro deste módulo, o
 * nome permanece correto e sem ambiguidade.
 */
export interface SchedulerProvider {
  schedule(scheduleId: string): Promise<void>;
}
