import type { Widget } from './Widget';

/** Contrato de persistência de Widget — apenas o contrato. */
export interface WidgetRepository {
  create(widget: Widget): Promise<Widget>;
  get(widgetId: string): Promise<Widget | undefined>;
  list(dashboardId: string): Promise<Widget[]>;
}
