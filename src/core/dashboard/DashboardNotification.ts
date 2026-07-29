/**
 * Contrato futuro (Tarefa 10) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de uma notificação disparada pelo
 * Dashboard (ex.: widget em status UNAVAILABLE por tempo prolongado).
 */
export interface DashboardNotification {
  id: string;
  widgetId: string;
  message: string;
  severity: "info" | "warning" | "critical";
  createdAt: Date;
}
