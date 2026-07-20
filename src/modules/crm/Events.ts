// Events.ts
//
// Responsabilidade:
// Definição dos tipos de evento do módulo crm — CRM (relacionamento com clientes). Este arquivo
// NÃO é um barramento de eventos — a emissão/escuta desses eventos deve
// ocorrer através do EventBus já existente em
// src/core/events/EventBus.ts.
//
// Nenhum nome de evento é definido nesta etapa (sem regra de negócio).

export const CrmEventTypes = {} as const;

export type CrmEventType =
  (typeof CrmEventTypes)[keyof typeof CrmEventTypes];
