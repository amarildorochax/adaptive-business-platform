// IntegrationRegistry.ts
//
// Responsabilidade:
// Catálogo de Adapters ativos, indexado por `CoreModuleId` — o mesmo
// padrão de registry já usado por `DashboardWidgetRegistry` (Sprint 28)
// e `dashboardWidgetRegistry`. Permite registrar novos módulos
// dinamicamente (`register`) sem exigir alterar `useCoreModule` nem
// nenhum consumidor existente.

import { allCoreModuleAdapters, type CoreModuleAdapter } from '../core/adapters';
import type { CoreModuleId } from '../types/ModuleId';

export class IntegrationRegistry {
  private adapters = new Map<CoreModuleId, CoreModuleAdapter>();

  register(adapter: CoreModuleAdapter): void {
    this.adapters.set(adapter.moduleId, adapter);
  }

  registerMany(adapters: CoreModuleAdapter[]): void {
    adapters.forEach((adapter) => this.register(adapter));
  }

  unregister(moduleId: CoreModuleId): void {
    this.adapters.delete(moduleId);
  }

  get(moduleId: CoreModuleId): CoreModuleAdapter | undefined {
    return this.adapters.get(moduleId);
  }

  getAll(): CoreModuleAdapter[] {
    return Array.from(this.adapters.values());
  }
}

/** Instância única e compartilhada do registry de integração, já populada com os 13 Adapters desta Sprint. */
export const integrationRegistry = new IntegrationRegistry();
integrationRegistry.registerMany(allCoreModuleAdapters);
