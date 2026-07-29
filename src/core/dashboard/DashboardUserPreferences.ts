/**
 * Contrato futuro (Tarefa 10) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de preferências de exibição do
 * Dashboard por usuário (widgets ocultos, ordenação, tema).
 */
export interface DashboardUserPreferences {
  userId: string;
  hiddenWidgetIds: string[];
  widgetOrder: string[];
  theme: "light" | "dark";
}
