/**
 * Forma genérica de um evento de domínio publicado através de EventBus.
 * `type` deve corresponder a uma das constantes de EventTypes.ts.
 */
export interface Event {
  id: string;

  type: string;

  source: string;

  target?: string;

  payload?: unknown;

  createdAt: Date;
}
