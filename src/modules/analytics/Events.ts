// Events.ts
//
// Responsabilidade:
// Definição dos tipos de evento do módulo analytics — Analytics (métricas e relatórios). Este arquivo
// NÃO é um barramento de eventos — a emissão/escuta desses eventos deve
// ocorrer através do EventBus já existente em
// src/core/events/EventBus.ts.
//
// Nenhum nome de evento é definido nesta etapa (sem regra de negócio).

export const AnalyticsEventTypes = {} as const;

export type AnalyticsEventType =
  (typeof AnalyticsEventTypes)[keyof typeof AnalyticsEventTypes];
