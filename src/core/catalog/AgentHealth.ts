/**
 * Retrato de saúde operacional de um Agent, mantido inteiramente em
 * memória (Tarefa 05 — "Preparar apenas em memória").
 *
 * `successRate` é `1` (100%) por padrão para um Agent ainda sem nenhuma
 * execução registrada — evita penalizar um Agent recém-catalogado antes
 * de ter qualquer histórico real.
 */
export interface AgentHealth {
  agentId: string;

  /** Se este Agent pode receber uma nova seleção agora — combina AgentProfileStatus e AgentStatus em tempo real (ver AgentCatalog.isAvailable()). */
  available: boolean;

  lastExecutionAt?: Date;

  totalExecutions: number;

  totalFailures: number;

  averageDurationMs: number;

  /** Proporção de execuções bem-sucedidas, de 0 a 1. */
  successRate: number;
}
