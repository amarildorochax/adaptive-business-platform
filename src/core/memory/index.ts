// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo memory — o Business Memory
// completo (BusinessMemory, MemoryManager, MemoryStore, MemoryIndex,
// MemoryMetrics, ContextBuilder, MemoryRecord, MemoryCategory, e os
// contratos futuros MemoryPersistenceAdapter/MemoryEmbedding/
// MemorySnapshot).
//
// Consumidores fora deste módulo devem preferir `businessMemory`
// (armazenamento/consulta direta) ou `contextBuilder` (geração de IA já
// enriquecida com contexto) — nunca MemoryManager/MemoryStore/
// MemoryIndex diretamente.

export * from './BusinessMemory';
export * from './MemoryManager';
export * from './MemoryStore';
export * from './MemoryIndex';
export * from './MemoryMetrics';
export * from './MemoryRecord';
export * from './MemoryCategory';
export * from './ContextBuilder';
export * from './MemoryPersistenceAdapter';
export * from './MemoryEmbedding';
export * from './MemorySnapshot';
