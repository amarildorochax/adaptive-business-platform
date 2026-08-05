import type { Dashboard } from './Dashboard';
import type { DashboardRepository } from './DashboardRepository';

/**
 * DashboardService — o conceito estrutural (container + Widget) tem precedente real em
 * `src/core/dashboard/Dashboard.ts` (Adaptive Dashboard legado), mas o conteúdo daquele legado é
 * observabilidade de plataforma (Runtime/EventBus/Agent/Knowledge), nunca Metric/KPI de negócio —
 * reutilizado apenas como padrão estrutural, nunca como dado (ver relatório desta Sprint). Dashboards
 * Are Read-Only (Blueprint ADR-002): nenhum método aqui, ou em `AnalyticsManager`, expõe escrita
 * sobre dado de outro domínio. Nenhuma emissão de Evento aqui — responsabilidade exclusiva de
 * AnalyticsManager.
 */
export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}

  async create(tenantId: string, name: string): Promise<Dashboard> {
    const dashboard: Dashboard = {
      dashboardId: crypto.randomUUID(),
      tenantId,
      name,
      widgetIds: [],
      archived: false,
      createdAt: new Date(),
    };

    return this.repository.create(dashboard);
  }

  async addWidget(dashboardId: string, widgetId: string): Promise<Dashboard> {
    const existing = await this.repository.get(dashboardId);

    if (!existing) {
      throw new Error(`Dashboard ${dashboardId} não encontrado.`);
    }

    return this.repository.update({ ...existing, widgetIds: [...existing.widgetIds, widgetId] });
  }

  async archive(dashboardId: string): Promise<Dashboard> {
    const existing = await this.repository.get(dashboardId);

    if (!existing) {
      throw new Error(`Dashboard ${dashboardId} não encontrado.`);
    }

    return this.repository.update({ ...existing, archived: true });
  }

  async get(dashboardId: string): Promise<Dashboard | undefined> {
    return this.repository.get(dashboardId);
  }

  async list(tenantId: string): Promise<readonly Dashboard[]> {
    return this.repository.list(tenantId);
  }
}
