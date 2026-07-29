/**
 * Visão geral consolidada da plataforma (Tarefa 06) — números agregados
 * de praticamente todos os subsistemas já construídos, sempre obtidos
 * via API pública, nunca calculados a partir de acesso interno.
 *
 * Quando um dado ainda não existe (ex.: nenhuma chamada de IA ainda
 * ocorreu), o campo correspondente usa um valor padrão neutro (`0`, ou
 * `"unknown"` para `platformStatus`) — nenhum módulo existente é
 * alterado para "adiantar" esse dado.
 */
export interface DashboardOverview {
  totalAgents: number;

  totalWorkflows: number;

  totalDocuments: number;

  totalEvents: number;

  totalMemories: number;

  totalPrompts: number;

  /** `undefined` quando nenhuma chamada de IA foi observada ainda ("se disponível", Tarefa 06). */
  averageAiLatencyMs?: number;

  /** Reflete `RuntimeWidget` — "unknown" até o primeiro evento de boot ser observado via EventBus. */
  platformStatus: string;

  generatedAt: Date;
}
