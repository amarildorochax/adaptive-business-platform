// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo events (Event, EventBus, EventTypes).
//
// Observability.ts (Sprint 0B) não é exportado aqui — não é uma API
// pública do módulo, é o subscriber interno chamado uma única vez por
// startPlatform() (via startObservability()).

export * from './Event';
export * from './EventBus';
export * from './EventTypes';
