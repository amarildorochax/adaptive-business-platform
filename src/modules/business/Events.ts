// Events.ts
//
// Responsabilidade:
// Definição dos tipos de evento do módulo business — Negócios (dados e operações da empresa). Este arquivo
// NÃO é um barramento de eventos — a emissão/escuta desses eventos deve
// ocorrer através do EventBus já existente em
// src/core/events/EventBus.ts.
//
// Nenhum nome de evento é definido nesta etapa (sem regra de negócio).

export const BusinessEventTypes = {} as const;

export type BusinessEventType =
  (typeof BusinessEventTypes)[keyof typeof BusinessEventTypes];
