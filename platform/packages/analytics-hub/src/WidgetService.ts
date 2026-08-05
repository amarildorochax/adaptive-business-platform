import type { Widget } from './Widget';
import type { WidgetRepository } from './WidgetRepository';

/** WidgetService — nenhum Evento aprovado cobre Widget isoladamente; sua criação faz parte do resultado de `AnalyticsManager.updateDashboard` (ver relatório desta Sprint). */
export class WidgetService {
  constructor(private readonly repository: WidgetRepository) {}

  async create(dashboardId: string, sourceId: string, title?: string): Promise<Widget> {
    const widget: Widget = { widgetId: crypto.randomUUID(), dashboardId, sourceId, title };
    return this.repository.create(widget);
  }

  async list(dashboardId: string): Promise<readonly Widget[]> {
    return this.repository.list(dashboardId);
  }
}
