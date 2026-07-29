// DashboardLayoutManager.ts
//
// Responsabilidade:
// Transformações puras sobre um `DashboardLayoutSnapshot` — criação do
// layout padrão, atualização de posição, reordenação e visibilidade,
// além de serialização. Deliberadamente **sem estado próprio**: cada
// método recebe o snapshot atual e retorna o próximo, para que
// `useDashboardLayout` seja quem guarda o estado (via `useState`) — o
// mesmo padrão usado pelas Stores do Core (transformação pura, sem
// efeito colateral).
//
// Persistência (Grid do Dashboard, "Persistência futura — somente
// contrato"): `serialize()`/`deserialize()` só convertem entre
// snapshot e string JSON, em memória. Nenhuma escrita em
// localStorage/API ocorre nesta Sprint — esse é o ponto de extensão
// reservado para quando a persistência real for implementada.

import type { DashboardLayoutEntry, DashboardLayoutSnapshot, WidgetDefinition, WidgetPosition } from '../types';

const LAYOUT_VERSION = 1;

export class DashboardLayoutManager {
  createDefaultSnapshot(definitions: WidgetDefinition[]): DashboardLayoutSnapshot {
    const entries: DashboardLayoutEntry[] = definitions.map((definition) => ({
      widgetId: definition.id,
      position: definition.position,
      visible: true,
    }));

    return { version: LAYOUT_VERSION, entries };
  }

  updatePosition(snapshot: DashboardLayoutSnapshot, widgetId: string, position: WidgetPosition): DashboardLayoutSnapshot {
    return {
      ...snapshot,
      entries: snapshot.entries.map((entry) => (entry.widgetId === widgetId ? { ...entry, position } : entry)),
    };
  }

  reorder(snapshot: DashboardLayoutSnapshot, orderedWidgetIds: string[]): DashboardLayoutSnapshot {
    const byId = new Map(snapshot.entries.map((entry) => [entry.widgetId, entry]));
    const reordered = orderedWidgetIds
      .map((widgetId) => byId.get(widgetId))
      .filter((entry): entry is DashboardLayoutEntry => entry !== undefined);

    return { ...snapshot, entries: reordered };
  }

  setVisibility(snapshot: DashboardLayoutSnapshot, widgetId: string, visible: boolean): DashboardLayoutSnapshot {
    return {
      ...snapshot,
      entries: snapshot.entries.map((entry) => (entry.widgetId === widgetId ? { ...entry, visible } : entry)),
    };
  }

  serialize(snapshot: DashboardLayoutSnapshot): string {
    return JSON.stringify(snapshot);
  }

  deserialize(json: string): DashboardLayoutSnapshot {
    return JSON.parse(json) as DashboardLayoutSnapshot;
  }
}

/** Instância única e compartilhada do gerenciador de layout do Dashboard. */
export const dashboardLayoutManager = new DashboardLayoutManager();
