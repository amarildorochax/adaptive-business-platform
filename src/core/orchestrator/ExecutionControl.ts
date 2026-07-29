/**
 * Contrato de controle de execução em andamento — cancelamento, pausa,
 * e retomada (Tarefa 10 — não implementado nesta Sprint).
 * `AgentOrchestrator.execute()` hoje é sempre síncrono do início ao fim
 * de todas as etapas — não retorna nenhum handle de controle, e não
 * pode ser interrompido, pausado, ou retomado.
 *
 * Responsabilidade reservada: quando implementado, `execute()` poderia
 * retornar um objeto deste formato imediatamente, permitindo ao
 * chamador controlar uma execução já em andamento. Nenhum componente
 * desta Sprint implementa nenhum destes três métodos.
 */
export interface ExecutionControlHandle {
  readonly planId: string;

  cancel(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
}
