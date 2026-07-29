import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import { DashboardManager } from "./DashboardManager";
import type { DashboardWidget } from "./DashboardWidget";
import type { DashboardOverview } from "./DashboardOverview";
import type { DashboardMetricsSnapshot } from "./DashboardMetrics";

/**
 * Fachada pública única do Adaptive Dashboard (Tarefa 02).
 *
 * ```
 * Application
 *    ↓
 * Dashboard.getOverview() / getWidgets() / refresh() / getMetrics()  ← único ponto de entrada
 *    ↓
 * DashboardManager                    ← coordena, sem lógica de negócio própria
 *    ↓
 * 7 widgets (Runtime/EventBus/Memory/Workflow/Agent/Knowledge/AIGateway)
 *    ↓ cada um consulta apenas a fachada pública do seu subsistema
 * Runtime · EventBus · AI Gateway · Business Memory · Prompt Manager ·
 * Workflow Engine · Agent Catalog · Knowledge Base   (todos inalterados)
 * ```
 *
 * Responsabilidade: nenhum consumidor deve importar DashboardManager,
 * DashboardRefresher, DashboardMetrics ou qualquer widget diretamente —
 * todos usam exclusivamente esta fachada. O Dashboard, por sua vez,
 * nunca lê nem calcula dados de negócio: apenas delega a DashboardManager
 * e emite os eventos de ciclo de vida do próprio Dashboard
 * (DASHBOARD_OPENED/DASHBOARD_REFRESHED — DASHBOARD_WIDGET_UPDATED é
 * emitido por DashboardManager, por widget, durante `refresh()`).
 *
 * Dependências: DashboardManager, EventBus/EventTypes.
 */
export class Dashboard {
  private readonly manager = new DashboardManager();

  /** Visão geral consolidada da plataforma; emite DASHBOARD_OPENED. */
  getOverview(): DashboardOverview {
    const overview = this.manager.getOverview();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.DASHBOARD_OPENED,
      source: "Dashboard",
      payload: { platformStatus: overview.platformStatus },
      createdAt: new Date(),
    });

    return overview;
  }

  /** Widgets atualmente em cache (coleta uma primeira vez se ainda vazio). */
  getWidgets(): DashboardWidget[] {
    return this.manager.getWidgets();
  }

  /** Força a reexecução dos sete widgets; emite DASHBOARD_REFRESHED. */
  refresh(): DashboardWidget[] {
    const widgets = this.manager.refresh();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.DASHBOARD_REFRESHED,
      source: "Dashboard",
      payload: { widgetsLoaded: widgets.length },
      createdAt: new Date(),
    });

    return widgets;
  }

  /** Métricas de uso do próprio Dashboard. */
  getMetrics(): DashboardMetricsSnapshot {
    return this.manager.getMetricsSnapshot();
  }
}

/** Instância única e compartilhada do Dashboard para toda a plataforma. */
export const dashboard = new Dashboard();
