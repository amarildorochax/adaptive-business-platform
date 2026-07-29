/** Natureza de uma Interaction registrada com um Customer. */
export type InteractionType = "call" | "email" | "meeting" | "note" | "other";

/**
 * Interação registrada com um Customer — ligação, e-mail, reunião,
 * anotação, etc. (Tarefa 05).
 */
export interface Interaction {
  id: string;

  customerId: string;

  type: InteractionType;

  description: string;

  createdAt: Date;

  metadata: Record<string, unknown>;
}
