import type { DashboardOverview } from "./DashboardOverview";

/**
 * Contrato futuro (Tarefa 10) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de exportação da DashboardOverview
 * (ex.: PDF/CSV) para uso futuro.
 */
export interface DashboardExport {
  format: "pdf" | "csv" | "json";
  generate(overview: DashboardOverview): Promise<Blob>;
}
