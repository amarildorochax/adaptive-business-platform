import type { LeadSource } from './LeadSource';
import type { LeadSourceRepository } from './LeadSourceRepository';

/**
 * LeadSourceService — nenhum precedente legado equivalente foi encontrado em `src/core/marketing`
 * ou `src/core/campaign` (nenhum dos dois modela origem de Lead como Entidade própria). Nenhuma
 * emissão de Evento aqui — responsabilidade exclusiva de GrowthManager.
 */
export class LeadSourceService {
  constructor(private readonly repository: LeadSourceRepository) {}

  async create(name: string): Promise<LeadSource> {
    const leadSource: LeadSource = { leadSourceId: crypto.randomUUID(), name };
    return this.repository.create(leadSource);
  }

  async get(leadSourceId: string): Promise<LeadSource | undefined> {
    return this.repository.get(leadSourceId);
  }

  async list(): Promise<readonly LeadSource[]> {
    return this.repository.list();
  }
}
