// DashboardWidgetRegistry.ts
//
// Responsabilidade:
// Catálogo de `WidgetDefinition` disponíveis no Dashboard. Guarda
// apenas metadados (id/title/description/icon/size/position/
// permissions/refreshPolicy) — nunca uma referência a componente React
// (isso evitaria um ciclo de import com `widgets/`, que é quem consome
// este serviço para saber QUAIS definições existem antes de resolver
// seu próprio componente de conteúdo).
//
// Preparado para integração futura: uma Sprint que conectar o Core
// poderia popular este registry a partir de uma fachada pública em vez
// de `widgets/index.ts` — a interface pública não mudaria.

import type { WidgetDefinition } from '../types';

export class DashboardWidgetRegistry {
  private definitions = new Map<string, WidgetDefinition>();

  register(definition: WidgetDefinition): void {
    this.definitions.set(definition.id, definition);
  }

  registerMany(definitions: WidgetDefinition[]): void {
    definitions.forEach((definition) => this.register(definition));
  }

  unregister(id: string): void {
    this.definitions.delete(id);
  }

  getAll(): WidgetDefinition[] {
    return Array.from(this.definitions.values());
  }

  getById(id: string): WidgetDefinition | undefined {
    return this.definitions.get(id);
  }
}

/** Instância única e compartilhada do catálogo de widgets do Dashboard. */
export const dashboardWidgetRegistry = new DashboardWidgetRegistry();
