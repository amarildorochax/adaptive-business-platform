/**
 * Simulation Run — o registro de que o Simulation Engine executou um Workflow inteiro contra dado
 * histórico ou hipotético, sem produzir nenhum efeito colateral real — nenhuma mensagem é de fato
 * enviada, nenhum registro é de fato criado (`AUTOMATION_ENGINE.md`, Capítulo 7).
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export type SimulationDataSource = "Historical" | "Hypothetical";

export interface SimulationRun {
  /** Identificador da Simulation Run. */
  readonly simulationRunId: string;

  /** Workflow simulado — ver Workflow.ts (Sprint 6.1). */
  readonly workflowId: string;

  /** Natureza do dado usado na simulação. */
  readonly dataSource: SimulationDataSource;

  /** Descrição do resultado observado, sem efeito colateral real. */
  readonly outcomeDescription: string;

  /** Momento da simulação. */
  readonly simulatedAt: Date;
}
