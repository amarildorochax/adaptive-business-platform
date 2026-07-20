// AutomationEvents.ts
//
// Responsabilidade:
// Definição dos tipos de evento do domínio de automação (início/fim de
// workflow, disparo de trigger, avaliação de regra). Este arquivo NÃO é
// um barramento de eventos — a emissão/escuta desses eventos deve
// ocorrer através do EventBus já existente em
// src/core/events/EventBus.ts.
//
// Nenhum nome de evento é definido nesta etapa (sem regra de negócio).

export const AutomationEventTypes = {} as const;

export type AutomationEventType =
  (typeof AutomationEventTypes)[keyof typeof AutomationEventTypes];
