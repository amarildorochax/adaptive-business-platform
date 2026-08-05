import type { Action, ActionCategory } from './Action';
import type { ActionRepository } from './ActionRepository';

/**
 * ActionService — adaptado de `src/core/automations/AutomationAction.ts` (Automation Center legado,
 * real e funcional): `type: string`/`target: string` livres são substituídos aqui por `category:
 * ActionCategory` (dez categorias já aprovadas) mais `targetDescription: string` opaco — mesmo
 * critério já aplicado em `TriggerService`. Nenhuma emissão de Evento/Audit aqui.
 */
export class ActionService {
  constructor(private readonly repository: ActionRepository) {}

  async define(category: ActionCategory, targetDescription: string, retryPolicyId?: string, timeoutSeconds?: number): Promise<Action> {
    const action: Action = { actionId: crypto.randomUUID(), category, targetDescription, retryPolicyId, timeoutSeconds };
    return this.repository.create(action);
  }

  async get(actionId: string): Promise<Action | undefined> {
    return this.repository.get(actionId);
  }
}
