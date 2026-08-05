import type { Lead } from './Lead';
import type { LeadRepository } from './LeadRepository';

/** Campos aceitos por `LeadService.create()`. */
export type CreateLeadInput = Pick<Lead, 'tenantId' | 'name' | 'email' | 'phone' | 'source'>;

/**
 * LeadService — adaptado do papel "lead" de `src/app/features/crm/types/Client.ts`. Cobre
 * exclusivamente o ciclo de vida do próprio Lead (criação, qualificação); a conversão de Lead em
 * Customer é uma operação que atravessa dois Aggregates (Lead e, via Relationship, Customer) e por
 * isso pertence ao CRMManager, nunca a este Service isoladamente — mesmo princípio de fronteira de
 * responsabilidade já disciplinado em `src/core/crm/CRMManager.ts`.
 *
 * Nunca marca um Lead como convertido — apenas como qualificado (`qualifiedAt`). A decisão de
 * pontuação/qualificação estratégica em si pertence ao Growth/Marketing Hub, já reconciliado em
 * `MARKETING_HUB_ARCHITECTURE.md`, ADR-MK-004 — este método apenas registra o resultado already
 * decidido alhures, nunca calcula pontuação.
 */
export class LeadService {
  constructor(private readonly repository: LeadRepository) {}

  async create(input: CreateLeadInput): Promise<Lead> {
    const lead: Lead = {
      leadId: crypto.randomUUID(),
      createdAt: new Date(),
      ...input,
    };

    return this.repository.create(lead);
  }

  async markQualified(leadId: string): Promise<Lead> {
    const existing = await this.repository.get(leadId);

    if (!existing) {
      throw new Error(`Lead ${leadId} não encontrado.`);
    }

    return this.repository.update({ ...existing, qualifiedAt: new Date() });
  }

  async get(leadId: string): Promise<Lead | undefined> {
    return this.repository.get(leadId);
  }

  async list(tenantId: string): Promise<readonly Lead[]> {
    return this.repository.list(tenantId);
  }
}
