// index.ts
//
// Responsabilidade:
// Ponto único de exportação da camada de controllers do Dashboard
// (Sprint 29A) — `WidgetController`, o modelo de estado padronizado, e
// os contratos (ainda não implementados) de cache, permissões,
// telemetria e feature flags.

export * from './WidgetController';
export * from './WidgetControllerStatus';
export * from './cache';
export * from './permissions';
export * from './telemetry';
export * from './featureFlags';
