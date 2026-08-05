import type { Lead } from './Lead';

/**
 * LeadRepository — contrato de persistência de Lead. Apenas a interface; nenhuma implementação de
 * armazenamento é fornecida por este pacote (IMP-002, Etapa 5 — "Criar apenas contratos. Não
 * implementar persistência."). Uma implementação concreta pertence à camada de Infrastructure,
 * fora do escopo desta Sprint.
 */
export interface LeadRepository {
  create(lead: Lead): Promise<Lead>;
  update(lead: Lead): Promise<Lead>;
  get(leadId: string): Promise<Lead | undefined>;
  list(tenantId: string): Promise<readonly Lead[]>;
}
