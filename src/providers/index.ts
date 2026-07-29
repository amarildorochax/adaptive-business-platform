// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo providers (mock, openai, claude, gemini).
//
// Nenhum consumidor fora de src/core/ai/* deve importar diretamente
// destes submódulos — todo acesso a IA passa por AIGateway
// (src/core/ai/AIGateway.ts), nunca por um provider concreto.

export * from './mock';
export * from './openai';
export * from './claude';
export * from './gemini';
