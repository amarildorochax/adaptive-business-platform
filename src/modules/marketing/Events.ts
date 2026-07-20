// Events.ts
//
// Responsabilidade:
// Definição dos tipos de evento do módulo marketing — Marketing (campanhas e conteúdo). Este arquivo
// NÃO é um barramento de eventos — a emissão/escuta desses eventos deve
// ocorrer através do EventBus já existente em
// src/core/events/EventBus.ts.
//
// Nenhum nome de evento é definido nesta etapa (sem regra de negócio).

export const MarketingEventTypes = {} as const;

export type MarketingEventType =
  (typeof MarketingEventTypes)[keyof typeof MarketingEventTypes];
