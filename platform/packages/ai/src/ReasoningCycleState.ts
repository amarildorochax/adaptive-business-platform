/**
 * Reasoning Cycle State — as cinco etapas do ciclo de raciocínio de um Agente, das quais nenhuma é
 * omitida, mesmo para uma subtarefa simples. Deliberadamente descrito sem referência a nenhum modelo
 * específico de inteligência artificial.
 * Estrutura definida em REASONING_CONCRETE_STRUCTURE.md.
 */
export type ReasoningStage =
  | "Análise"
  | "Síntese"
  | "Inferência"
  | "Validação"
  | "Explicabilidade";

export interface ReasoningCycleState {
  /** Agente que executa o ciclo de raciocínio. */
  readonly agentId: string;

  /** Subtarefa sobre a qual o raciocínio é aplicado. */
  readonly subtaskId: string;

  /** Etapa atual do ciclo. */
  readonly stage: ReasoningStage;

  /** Momento em que o ciclo entrou nesta etapa. */
  readonly enteredAt: Date;
}
