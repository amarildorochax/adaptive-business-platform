// PlatformRegistry.ts
//
// Responsabilidade:
// Ponto único de composição dos registries especializados da plataforma.
// Não implementa lógica de registro — apenas declara a futura
// coordenação entre ModuleRegistry, ConnectorRegistry, ServiceRegistry e
// o AgentRegistry já existente. Nenhuma instância é criada nem conectada
// ao runtime da aplicação nesta etapa; as propriedades são opcionais e
// permanecem "undefined" até que uma etapa futura decida como compô-las.
//
// AgentRegistry é referenciado apenas por tipo (import type), como
// referência futura ao registry já existente em
// src/core/agents/registry/AgentRegistry.ts — sem integração nesta etapa.

import type { ModuleRegistry } from './ModuleRegistry';
import type { ServiceRegistry } from './ServiceRegistry';
import type { ConnectorRegistry } from '../connectors/ConnectorRegistry';
import type { AgentRegistry } from '../agents/registry/AgentRegistry';

export class PlatformRegistry {
  moduleRegistry?: ModuleRegistry;

  connectorRegistry?: ConnectorRegistry;

  serviceRegistry?: ServiceRegistry;

  // Referência futura, sem integração nesta etapa.
  agentRegistry?: AgentRegistry;
}
