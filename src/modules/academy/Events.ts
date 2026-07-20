// Events.ts
//
// Responsabilidade:
// Definição dos tipos de evento do módulo academy — Academy (treinamentos e conteúdo educacional). Este arquivo
// NÃO é um barramento de eventos — a emissão/escuta desses eventos deve
// ocorrer através do EventBus já existente em
// src/core/events/EventBus.ts.
//
// Nenhum nome de evento é definido nesta etapa (sem regra de negócio).

export const AcademyEventTypes = {} as const;

export type AcademyEventType =
  (typeof AcademyEventTypes)[keyof typeof AcademyEventTypes];
