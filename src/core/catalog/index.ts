// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo catalog — o catálogo de Agents
// completo (AgentCatalog, AgentCapabilityRegistry, AgentHealthMonitor,
// AgentCatalogMetrics, AgentProfile, AgentProfileStatus, AgentMetadata,
// AgentHealth, ExecutionPriority, AgentCapability (Etapa 24A —
// Correção 01, movidos de `@/core/orchestrator`), e os contratos
// futuros AgentVersioning/AgentDependency/AgentPermission/
// AgentExecutionPolicy/AgentDiscovery).
//
// Consumidores fora deste módulo devem preferir `agentCatalog` — nunca
// AgentCapabilityRegistry/AgentHealthMonitor diretamente, exceto
// AgentSelector (`@/core/orchestrator`), autorizado pela Sprint Agent
// Catalog, Tarefa 06.

export * from './AgentCatalog';
export * from './AgentCapabilityRegistry';
export * from './AgentHealthMonitor';
export * from './AgentCatalogMetrics';
export * from './AgentProfile';
export * from './AgentProfileStatus';
export * from './AgentMetadata';
export * from './AgentHealth';
export * from './ExecutionPriority';
export * from './AgentCapability';
export * from './AgentVersioning';
export * from './AgentDependency';
export * from './AgentPermission';
export * from './AgentExecutionPolicy';
export * from './AgentDiscovery';
