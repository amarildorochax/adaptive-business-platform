import type { Action } from './Action';

/** Contrato de persistência de Action — apenas o contrato. */
export interface ActionRepository {
  create(action: Action): Promise<Action>;
  get(actionId: string): Promise<Action | undefined>;
}
