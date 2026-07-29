// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo knowledge — o Knowledge Base
// completo (KnowledgeBase, KnowledgeManager, KnowledgeStore,
// KnowledgeIndex, KnowledgeSearch, KnowledgeProvider,
// KnowledgeMetrics, KnowledgeDocument, KnowledgeCategory,
// KnowledgeStatus, e os contratos futuros
// KnowledgePersistenceAdapter/KnowledgeEmbedding/KnowledgeSnapshot/
// KnowledgeImportExport/KnowledgeSource).
//
// Consumidores fora deste módulo devem preferir `knowledgeBase`
// (armazenamento/consulta direta) ou `knowledgeProvider` (ponto oficial
// de integração futura) — nunca KnowledgeManager/KnowledgeStore/
// KnowledgeSearch/KnowledgeIndex diretamente.

export * from './KnowledgeBase';
export * from './KnowledgeManager';
export * from './KnowledgeStore';
export * from './KnowledgeIndex';
export * from './KnowledgeSearch';
export * from './KnowledgeProvider';
export * from './KnowledgeMetrics';
export * from './KnowledgeDocument';
export * from './KnowledgeCategory';
export * from './KnowledgeStatus';
export * from './KnowledgePersistenceAdapter';
export * from './KnowledgeEmbedding';
export * from './KnowledgeSnapshot';
export * from './KnowledgeImportExport';
export * from './KnowledgeSource';
