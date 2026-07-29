// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo ai — o AI Gateway completo
// (AIGateway, AIRouter, AIProviderFactory, AIProviderRegistry,
// BaseAIProvider, AIProvider, AIRequest, AIResponse, AIError,
// AITokenUsage, AIModel, ProviderCapabilities, AIRequestOptions,
// AIMetrics).
//
// Nenhum provider concreto (Mock/OpenAI/Claude/Gemini, em
// src/providers/*) é exportado aqui — eles são detalhe de
// implementação interno ao AI Gateway; nenhum consumidor externo deve
// importá-los diretamente.

export * from './AIGateway';
export * from './AIRouter';
export * from './AIProviderFactory';
export * from './AIProviderRegistry';
export * from './BaseAIProvider';
export * from './AIProvider';
export * from './AIRequest';
export * from './AIResponse';
export * from './AIError';
export * from './AITokenUsage';
export * from './AIModel';
export * from './ProviderCapabilities';
export * from './AIRequestOptions';
export * from './AIMetrics';
