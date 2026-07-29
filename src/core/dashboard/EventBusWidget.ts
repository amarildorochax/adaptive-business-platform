import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import { DashboardWidgetType } from "./DashboardWidgetType";
import { DashboardWidgetStatus } from "./DashboardWidgetStatus";
import type { DashboardWidget } from "./DashboardWidget";

/**
 * Conta quantos eventos, de cada tipo já catalogado, passaram pelo
 * EventBus desde que este módulo foi carregado.
 *
 * Nota de projeto: `EventBus` (`@/core/events/EventBus.ts`, inalterado)
 * não mantém, ele mesmo, nenhuma contagem ou histórico — apenas
 * `subscribe()`/`emit()`/`clear()`. Não existe também nenhuma forma de
 * assinar "todos os eventos" de uma vez (`subscribe()` exige um `type`
 * específico). Este rastreador assina individualmente cada valor já
 * catalogado em `EventTypes` (`Object.values(EventTypes)`, público, sem
 * precisar listar cada nome manualmente) e incrementa um contador local
 * por tipo — nenhum acesso interno ao EventBus, apenas sua API pública
 * de assinatura, usada exatamente como qualquer outro assinante da
 * plataforma (ex.: Observability.ts).
 */
class EventCountTracker {
  private readonly countsByType = new Map<string, number>();

  private total = 0;

  constructor() {
    for (const type of Object.values(EventTypes)) {
      eventBus.subscribe(type, () => this.record(type));
    }
  }

  private record(type: string): void {
    this.countsByType.set(type, (this.countsByType.get(type) ?? 0) + 1);
    this.total++;
  }

  getTotal(): number {
    return this.total;
  }

  getCountsByType(): Record<string, number> {
    return Object.fromEntries(this.countsByType);
  }
}

const eventCountTracker = new EventCountTracker();

/**
 * Total de eventos observados por `eventCountTracker` desde o carregamento
 * deste módulo — usado por DashboardManager ao montar DashboardOverview
 * (`totalEvents`). Não é leitura de `widget.data` (que permanece opaco
 * para DashboardManager, ver DashboardWidget.ts); é uma consulta direta
 * ao mesmo rastreador que também alimenta buildEventBusWidget().
 */
export function getTrackedEventTotal(): number {
  return eventCountTracker.getTotal();
}

/** Monta o EventBusWidget — quantidade de eventos observados desde o carregamento do Dashboard, por tipo (Tarefa 05). */
export function buildEventBusWidget(): DashboardWidget {
  const total = eventCountTracker.getTotal();

  return {
    id: "event-bus",
    title: "Event Bus",
    type: DashboardWidgetType.EVENT_BUS,
    status: total > 0 ? DashboardWidgetStatus.OK : DashboardWidgetStatus.EMPTY,
    data: {
      totalEvents: total,
      countsByType: eventCountTracker.getCountsByType(),
    },
    updatedAt: new Date(),
  };
}
