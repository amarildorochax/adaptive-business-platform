import { describe, expect, it } from 'vitest';
import { RelationshipService } from './RelationshipService';
import { FakeRelationshipRepository } from './testing/InMemoryFakes';

describe('RelationshipService', () => {
  it('cria um Relationship Active/New com Account Manager único', async () => {
    const service = new RelationshipService(new FakeRelationshipRepository());

    const relationship = await service.create({
      tenantId: 'tenant-1',
      partyType: 'Customer',
      partyId: 'party-1',
      accountManagerId: 'am-1',
    });

    expect(relationship.status).toBe('Active');
    expect(relationship.lifecycleStage).toBe('New');
    expect(relationship.accountManagerId).toBe('am-1');
  });

  it('altera status sem afetar lifecycleStage', async () => {
    const service = new RelationshipService(new FakeRelationshipRepository());
    const created = await service.create({
      tenantId: 'tenant-1',
      partyType: 'Organization',
      partyId: 'party-2',
      accountManagerId: 'am-1',
    });

    const updated = await service.changeStatus(created.relationshipId, 'Archived');

    expect(updated.status).toBe('Archived');
    expect(updated.lifecycleStage).toBe('New');
  });

  it('lança erro ao alterar status de Relationship inexistente', async () => {
    const service = new RelationshipService(new FakeRelationshipRepository());
    await expect(service.changeStatus('inexistente', 'Archived')).rejects.toThrow();
  });
});
