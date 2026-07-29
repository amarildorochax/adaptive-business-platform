// index.ts
//
// Responsabilidade:
// Ponto único de exportação da camada `core/` da integração — hoje
// apenas `adapters/`. Nome escolhido para espelhar a nomenclatura do
// ESCOPO da Sprint 30 ("Core Facades"); não deve ser confundido com
// `@/core` (o Core v1.0 em si) — este `core/` vive inteiramente dentro
// de `@/app/integrations`.

export * from './adapters';
