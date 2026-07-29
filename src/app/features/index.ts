// index.ts
//
// Responsabilidade:
// Ponto único de exportação da camada de features do Frontend
// Foundation. Cada subdiretório corresponde a um domínio de negócio
// (normalmente espelhando um módulo de `@/core`) e está
// intencionalmente vazio nesta etapa — apenas a estrutura arquitetural
// definitiva foi criada (Sprint 27A, Correção 01), preparando o
// crescimento das Sprints 28+ sem necessidade de reorganização futura.
//
// Ver o `README.md` de cada subdiretório para sua finalidade específica
// e qual fachada do Core deverá consumir quando for implementado.
//
// Regra de composição (Correção 03): features/ consome
// `@/design-system` (componentes visuais) e a fachada pública do
// módulo correspondente em `@/core` — nunca o inverso, e nunca
// Managers/Services/Stores do Core diretamente.

export * from './crm';
export * from './campaign';
export * from './marketing';
export * from './finance';
export * from './analytics';
export * from './dashboard';
export * from './automation';
export * from './workflow';
export * from './execution';
export * from './notifications';
export * from './business-intelligence';
export * from './knowledge';
export * from './settings';
