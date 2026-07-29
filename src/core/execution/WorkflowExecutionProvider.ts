/**
 * Contrato futuro (Tarefa 09) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de uma ExecutionRequest disparando um
 * Workflow real (`@/core/workflow`, inalterado) — hoje nenhum Workflow
 * é executado.
 *
 * Nota de nomenclatura: mesmo nome de `@/core/automations/
 * WorkflowExecutionProvider.ts` (Sprint 14, também um contrato futuro
 * nunca implementado, mesmo formato de método) — intencional, pedido
 * assim pela Tarefa 09 desta Sprint. Colide no barrel de topo
 * (`core/index.ts`), resolvido excluindo `./execution` de lá (ver nota
 * em Execution.ts) — dentro deste módulo, o nome permanece correto e
 * sem ambiguidade.
 */
export interface WorkflowExecutionProvider {
  run(requestId: string): Promise<void>;
}
