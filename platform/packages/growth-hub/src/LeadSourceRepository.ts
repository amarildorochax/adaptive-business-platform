import type { LeadSource } from './LeadSource';

/** Contrato de persistência de Lead Source — apenas o contrato, per Etapa 7 (IMP-005). */
export interface LeadSourceRepository {
  create(leadSource: LeadSource): Promise<LeadSource>;
  get(leadSourceId: string): Promise<LeadSource | undefined>;
  list(): Promise<LeadSource[]>;
}
