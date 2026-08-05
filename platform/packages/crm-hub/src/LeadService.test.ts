import { describe, expect, it } from 'vitest';
import { LeadService } from './LeadService';
import { FakeLeadRepository } from './testing/InMemoryFakes';

describe('LeadService', () => {
  it('cria um Lead sem qualifiedAt', async () => {
    const service = new LeadService(new FakeLeadRepository());

    const lead = await service.create({
      tenantId: 'tenant-1',
      name: 'Maria Souza',
      email: 'maria@example.com',
      phone: undefined,
      source: 'landing-page',
    });

    expect(lead.qualifiedAt).toBeUndefined();
    expect(lead.name).toBe('Maria Souza');
  });

  it('marca um Lead como qualificado sem alterar os demais campos', async () => {
    const service = new LeadService(new FakeLeadRepository());
    const created = await service.create({
      tenantId: 'tenant-1',
      name: 'João Lima',
      email: undefined,
      phone: '11999990000',
      source: 'whatsapp',
    });

    const qualified = await service.markQualified(created.leadId);

    expect(qualified.qualifiedAt).toBeInstanceOf(Date);
    expect(qualified.source).toBe('whatsapp');
  });
});
