// ProviderFactory.ts
//
// Responsabilidade:
// Fábrica para criar e registrar um novo Adapter dinamicamente — usada
// quando um módulo precisa ser adicionado sem escrever uma nova classe
// em `core/adapters/` (ex.: um módulo experimental, ou um mock em
// testes). O Adapter criado segue exatamente o mesmo contrato
// `CoreModuleAdapter` dos 13 Adapters estáticos — nenhuma
// implementação real é fornecida por este factory.

import { NotImplementedCoreModuleAdapter } from '../core/adapters/NotImplementedCoreModuleAdapter';
import type { CoreModuleAdapter } from '../core/adapters/CoreModuleAdapter';
import type { CoreModuleId } from '../types/ModuleId';
import { integrationRegistry } from './IntegrationRegistry';

class DynamicCoreModuleAdapter extends NotImplementedCoreModuleAdapter {
  readonly moduleId: CoreModuleId;

  constructor(moduleId: CoreModuleId) {
    super();
    this.moduleId = moduleId;
  }
}

/** Cria um Adapter "não implementado" para `moduleId` e o registra em `integrationRegistry`. */
export function createAndRegisterAdapter(moduleId: CoreModuleId): CoreModuleAdapter {
  const adapter = new DynamicCoreModuleAdapter(moduleId);
  integrationRegistry.register(adapter);
  return adapter;
}
