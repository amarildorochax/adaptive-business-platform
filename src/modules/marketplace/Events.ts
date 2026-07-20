// Events.ts
//
// Responsabilidade:
// Definição dos tipos de evento do módulo marketplace — Marketplace (produtos e integrações de terceiros). Este arquivo
// NÃO é um barramento de eventos — a emissão/escuta desses eventos deve
// ocorrer através do EventBus já existente em
// src/core/events/EventBus.ts.
//
// Nenhum nome de evento é definido nesta etapa (sem regra de negócio).

export const MarketplaceEventTypes = {} as const;

export type MarketplaceEventType =
  (typeof MarketplaceEventTypes)[keyof typeof MarketplaceEventTypes];
