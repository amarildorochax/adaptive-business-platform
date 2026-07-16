export interface Event {
  id: string;

  type: string;

  source: string;

  target?: string;

  payload?: unknown;

  createdAt: Date;
}