// ConnectorEvents.ts
//
// Responsabilidade:
// Definição dos tipos de evento do domínio de conectores (conexão,
// desconexão, falha, sincronização). Este arquivo NÃO é um barramento
// de eventos — a emissão/escuta desses eventos deve ocorrer através do
// EventBus já existente em src/core/events/EventBus.ts.
//
// Nenhum nome de evento é definido nesta etapa (sem regra de negócio).

export const ConnectorEventTypes = {} as const;

export type ConnectorEventType =
  (typeof ConnectorEventTypes)[keyof typeof ConnectorEventTypes];
