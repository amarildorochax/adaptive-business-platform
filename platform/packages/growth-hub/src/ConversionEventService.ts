import type { ConversionEvent } from './ConversionEvent';
import type { ConversionEventRepository } from './ConversionEventRepository';

/**
 * ConversionEventService — adaptado, na intenção de granularidade individual e imutável, do retrato
 * agregado `src/core/campaign/CampaignResult.ts` (legado regista `converted: number` como contagem
 * agregada por retrato, nunca um Conversion Event individual) — a forma aprovada pelo Blueprint é mais
 * fina, e esta Sprint nunca agrega o legado de volta a algo diferente do já aprovado. Nunca expõe
 * `update`, per `ConversionsPreserveHistory` (`GrowthBusinessRule.ts`).
 */
export class ConversionEventService {
  constructor(private readonly repository: ConversionEventRepository) {}

  async register(conversionGoalId: string, sourceId?: string): Promise<ConversionEvent> {
    const conversionEvent: ConversionEvent = {
      conversionEventId: crypto.randomUUID(),
      conversionGoalId,
      sourceId,
      registeredAt: new Date(),
    };

    return this.repository.create(conversionEvent);
  }

  async get(conversionEventId: string): Promise<ConversionEvent | undefined> {
    return this.repository.get(conversionEventId);
  }

  async listByGoal(conversionGoalId: string): Promise<readonly ConversionEvent[]> {
    return this.repository.listByGoal(conversionGoalId);
  }
}
