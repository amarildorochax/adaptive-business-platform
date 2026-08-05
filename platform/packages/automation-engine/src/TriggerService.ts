import type { Trigger, TriggerCategory } from './Trigger';
import type { TriggerRepository } from './TriggerRepository';

/**
 * TriggerService — adaptado de `src/core/automations/AutomationTrigger.ts` (Automation Center
 * legado, real e funcional): `eventType: string` livre é substituído aqui por `category:
 * TriggerCategory` (oito categorias já aprovadas) mais `sourceDescription: string` opaco — o legado
 * nunca distinguia categoria de Trigger (Tempo/Evento/Manual/...), apenas um `eventType` solto; esta
 * Sprint nunca reduz o vocabulário já aprovado para a forma mais simples do legado. Nenhuma emissão
 * de Evento/Audit aqui.
 */
export class TriggerService {
  constructor(private readonly repository: TriggerRepository) {}

  async register(tenantId: string, category: TriggerCategory, sourceDescription: string): Promise<Trigger> {
    const trigger: Trigger = { triggerId: crypto.randomUUID(), tenantId, category, sourceDescription, registeredAt: new Date() };
    return this.repository.create(trigger);
  }

  async get(triggerId: string): Promise<Trigger | undefined> {
    return this.repository.get(triggerId);
  }

  async list(tenantId: string): Promise<readonly Trigger[]> {
    return this.repository.list(tenantId);
  }
}
