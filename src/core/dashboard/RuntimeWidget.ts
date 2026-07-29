import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import { DashboardWidgetType } from "./DashboardWidgetType";
import { DashboardWidgetStatus } from "./DashboardWidgetStatus";
import type { DashboardWidget } from "./DashboardWidget";

type LastBootSignal = "started" | "completed" | "failed";

/**
 * Rastreia o último sinal de boot já observado via EventBus — única
 * forma pública de saber algo sobre o estado do Runtime nesta Sprint.
 *
 * Nota de projeto: `PlatformRuntime`/`Platform`
 * (`@/core/platform`, inalterados) nunca expõem uma instância singleton
 * pública — `startPlatform.ts` mantém sua própria instância em uma
 * variável de módulo privada, nunca exportada. Não há, portanto,
 * nenhuma API pública para consultar `PlatformRuntime.getState()`
 * diretamente. Este widget resolve isso da mesma forma já usada por
 * `AgentHealthMonitor` (Sprint Agent Catalog): assina os eventos que
 * `PlatformRuntime.init()` já emite (`PLATFORM_BOOT_STARTED/COMPLETED/
 * FAILED`) através do EventBus — cross-cutting, público, nunca parte do
 * Runtime em si — e mantém, localmente, apenas o último sinal
 * observado. Nenhum campo de `event.payload` é lido — apenas
 * `event.type`, já tipado como `string` em `Event` — logo nenhum cast é
 * necessário em nenhum momento.
 */
class RuntimeStatusTracker {
  private lastSignal: LastBootSignal | undefined;

  private lastObservedAt: Date | undefined;

  constructor() {
    eventBus.subscribe(EventTypes.PLATFORM_BOOT_STARTED, () => this.record("started"));
    eventBus.subscribe(EventTypes.PLATFORM_BOOT_COMPLETED, () => this.record("completed"));
    eventBus.subscribe(EventTypes.PLATFORM_BOOT_FAILED, () => this.record("failed"));
  }

  private record(signal: LastBootSignal): void {
    this.lastSignal = signal;
    this.lastObservedAt = new Date();
  }

  getLastSignal(): LastBootSignal | undefined {
    return this.lastSignal;
  }

  getLastObservedAt(): Date | undefined {
    return this.lastObservedAt;
  }
}

const runtimeStatusTracker = new RuntimeStatusTracker();

/**
 * Último status de plataforma já observado por `runtimeStatusTracker` —
 * usado por DashboardManager ao montar DashboardOverview
 * (`platformStatus`). Não é leitura de `widget.data` (que permanece
 * opaco para DashboardManager, ver DashboardWidget.ts); é uma consulta
 * direta ao mesmo rastreador que também alimenta buildRuntimeWidget().
 */
export function getPlatformStatus(): string {
  return runtimeStatusTracker.getLastSignal() ?? "unknown";
}

/** Monta o RuntimeWidget — reflete apenas o último sinal de boot já observado via EventBus (Tarefa 05). */
export function buildRuntimeWidget(): DashboardWidget {
  const signal = runtimeStatusTracker.getLastSignal();
  const observedAt = runtimeStatusTracker.getLastObservedAt();

  return {
    id: "runtime",
    title: "Runtime",
    type: DashboardWidgetType.RUNTIME,
    status: signal ? DashboardWidgetStatus.OK : DashboardWidgetStatus.UNAVAILABLE,
    data: {
      lastBootSignal: signal ?? "unknown",
      lastObservedAt: observedAt ?? null,
    },
    updatedAt: new Date(),
  };
}
