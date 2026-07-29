// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo prompt — o Prompt Manager
// completo (PromptManager, PromptBuilder, PromptRegistry,
// PromptMetrics, PromptRecord, PromptTemplate, PromptType,
// PromptVariable, e os contratos futuros PromptSnapshot/PromptLibrary/
// PromptExport/PromptMarketplaceListing/PromptABTest).
//
// Consumidores fora deste módulo devem preferir `promptManager` — nunca
// PromptRegistry/PromptBuilder diretamente.

export * from './PromptManager';
export * from './PromptBuilder';
export * from './PromptRegistry';
export * from './PromptMetrics';
export * from './PromptRecord';
export * from './PromptTemplate';
export * from './PromptType';
export * from './PromptVariable';
export * from './PromptSnapshot';
export * from './PromptLibrary';
export * from './PromptExport';
export * from './PromptMarketplaceListing';
export * from './PromptABTest';
