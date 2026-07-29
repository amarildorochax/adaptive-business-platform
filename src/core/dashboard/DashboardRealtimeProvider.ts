import type { DashboardWidget } from "./DashboardWidget";

/**
 * Contrato futuro (Tarefa 10) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um provedor de atualização em
 * tempo real (ex.: WebSocket/SSE) que futuramente poderia substituir o
 * `refresh()` sob demanda de DashboardRefresher por um fluxo contínuo.
 */
export interface DashboardRealtimeProvider {
  subscribe(onUpdate: (widget: DashboardWidget) => void): void;
  unsubscribe(): void;
}
