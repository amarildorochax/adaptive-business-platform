// Events.ts
//
// Responsabilidade:
// Definição dos tipos de evento do módulo projects — Projetos (planejamento e execução). Este arquivo
// NÃO é um barramento de eventos — a emissão/escuta desses eventos deve
// ocorrer através do EventBus já existente em
// src/core/events/EventBus.ts.
//
// Nenhum nome de evento é definido nesta etapa (sem regra de negócio).

export const ProjectsEventTypes = {} as const;

export type ProjectsEventType =
  (typeof ProjectsEventTypes)[keyof typeof ProjectsEventTypes];
