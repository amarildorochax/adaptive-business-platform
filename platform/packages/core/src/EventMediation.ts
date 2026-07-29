/**
 * Event Mediation Contract — mediação abstrata de comunicação entre módulos, exclusivamente por Evento.
 * Estrutura, regras e invariantes definidas em BASE_CONTRACTS_CONCRETE_STRUCTURE.md.
 */
import type { Event } from "./Event.js";

export interface EventPublisher {
  /** Publica um Evento já existente, sem aguardar confirmação síncrona de nenhum assinante. */
  publish<TPayload>(event: Event<TPayload>): void;
}

export interface EventSubscriber {
  /** Registra um manipulador para consumir Eventos de um nome específico, sem chamada direta ao publicador. */
  subscribe<TPayload>(eventName: string, handler: (event: Event<TPayload>) => void): void;
}
