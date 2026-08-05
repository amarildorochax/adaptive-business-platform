/**
 * Business Profile Event — os três Eventos já catalogados em `EVENT_CATALOG.md`, seção "Business
 * Profile Engine" (`BusinessProfileCreated`, `CapabilityEnabled`, `CapabilityDisabled`) — classificados
 * naquele catálogo como "Platform Events". Mesma disciplina de declarar o catálogo completo já
 * aplicada a `BusinessProfileCommand.ts`; apenas `BusinessProfileCreated` tem produtor real nesta
 * Sprint.
 *
 * `BusinessAdaptationCompleted` — citado apenas em prosa (`EVENT_CATALOG.md`, exemplo de fluxo:
 * "Reação a mudança de perfil de negócio") — nunca recebe entrada formal de catálogo com Produtor/
 * Consumidor/Payload conceitual definidos, ao contrário dos três Eventos acima. Não incluído neste
 * tipo — mesma disciplina de "nunca inventar" já aplicada a `SemanticIndexUpdated` (IMP-015) e a
 * `APIRegistered` (IMP-016); registrado como lacuna no relatório desta Sprint.
 */
export type BusinessProfileEventType = "BusinessProfileCreated" | "CapabilityEnabled" | "CapabilityDisabled";

export interface BusinessProfileEvent {
  /** Identificador do Evento. */
  readonly eventId: string;

  /** Tipo do Evento. */
  readonly type: BusinessProfileEventType;

  /** Momento em que o Fato ocorreu. */
  readonly occurredAt: Date;
}
