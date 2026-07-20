// PlatformEvents.ts
//
// Responsabilidade:
// Definição dos tipos de evento do domínio de plataforma (ciclo de vida,
// inicialização, mudança de configuração). Este arquivo NÃO é um
// barramento de eventos — não deve conter classes, emissores ou
// listeners. A emissão/escuta desses eventos deve ocorrer através do
// EventBus já existente em src/core/events/EventBus.ts, usando o formato
// definido em src/core/events/Event.ts.
//
// Nenhum nome de evento é definido nesta etapa (sem regra de negócio).

export const PlatformEventTypes = {} as const;

export type PlatformEventType =
  (typeof PlatformEventTypes)[keyof typeof PlatformEventTypes];
