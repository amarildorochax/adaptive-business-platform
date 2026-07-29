/**
 * Observability Event — o registro formal de uma mudança de estado interna relevante ao
 * processamento de IA, nunca confundido com o Evento de domínio já catalogado em EVENT_CATALOG.md.
 * Estrutura definida em AI_OBSERVABILITY_CONCRETE_STRUCTURE.md.
 */
import type { ObservabilityContext } from "./ObservabilityContext.js";

export interface ObservabilityEvent {
  /** Identificador do evento observável. */
  readonly eventId: string;

  /** Contexto de correlação deste evento. */
  readonly context: ObservabilityContext;

  /** Descrição da mudança de estado registrada. */
  readonly description: string;

  /** Momento em que a mudança de estado ocorreu. */
  readonly occurredAt: Date;
}
