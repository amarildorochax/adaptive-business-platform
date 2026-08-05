import type { Dashboard } from './Dashboard';

/** Contrato de persistência de Dashboard — apenas o contrato. Sem `remove` — `archived` representa o ciclo de vida final, nunca remoção física. */
export interface DashboardRepository {
  create(dashboard: Dashboard): Promise<Dashboard>;
  update(dashboard: Dashboard): Promise<Dashboard>;
  get(dashboardId: string): Promise<Dashboard | undefined>;
  list(tenantId: string): Promise<Dashboard[]>;
}
