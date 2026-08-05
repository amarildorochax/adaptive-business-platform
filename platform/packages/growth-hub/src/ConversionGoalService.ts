import type { ConversionGoal } from './ConversionGoal';
import type { ConversionGoalRepository } from './ConversionGoalRepository';

/**
 * ConversionGoalService — nenhum precedente legado equivalente foi encontrado. Nenhuma emissão de
 * Evento aqui — responsabilidade exclusiva de GrowthManager.
 */
export class ConversionGoalService {
  constructor(private readonly repository: ConversionGoalRepository) {}

  async create(description: string): Promise<ConversionGoal> {
    const conversionGoal: ConversionGoal = { conversionGoalId: crypto.randomUUID(), description };
    return this.repository.create(conversionGoal);
  }

  async get(conversionGoalId: string): Promise<ConversionGoal | undefined> {
    return this.repository.get(conversionGoalId);
  }

  async list(): Promise<readonly ConversionGoal[]> {
    return this.repository.list();
  }
}
