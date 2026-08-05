import { describe, expect, it } from 'vitest';
import { OpportunityService } from './OpportunityService';
import { FakeOpportunityRepository } from './testing/InMemoryFakes';

describe('OpportunityService', () => {
  it('cria uma Opportunity com outcome Open e sem closedAt', async () => {
    const service = new OpportunityService(new FakeOpportunityRepository());

    const opportunity = await service.create(
      { tenantId: 'tenant-1', title: 'Plano Enterprise', value: 12000, pipelineId: 'pipeline-1', stageId: 'stage-1' },
      'relationship-1',
    );

    expect(opportunity.outcome).toBe('Open');
    expect(opportunity.closedAt).toBeUndefined();
  });

  it('ao mover para Won, registra closedAt e limpa lostReason', async () => {
    const service = new OpportunityService(new FakeOpportunityRepository());
    const created = await service.create(
      { tenantId: 'tenant-1', title: 'Plano Pro', value: 5000, pipelineId: 'pipeline-1', stageId: 'stage-1' },
      'relationship-1',
    );

    const won = await service.move(created.opportunityId, 'stage-final', 'Won');

    expect(won.outcome).toBe('Won');
    expect(won.closedAt).toBeInstanceOf(Date);
    expect(won.lostReason).toBeUndefined();
  });

  it('ao mover para Lost, preserva o motivo informado', async () => {
    const service = new OpportunityService(new FakeOpportunityRepository());
    const created = await service.create(
      { tenantId: 'tenant-1', title: 'Plano Pro', value: 5000, pipelineId: 'pipeline-1', stageId: 'stage-1' },
      'relationship-1',
    );

    const lost = await service.move(created.opportunityId, 'stage-final', 'Lost', 'Preço acima do orçamento do cliente.');

    expect(lost.outcome).toBe('Lost');
    expect(lost.lostReason).toBe('Preço acima do orçamento do cliente.');
  });

  it('ao mover mantendo Open, não define closedAt', async () => {
    const service = new OpportunityService(new FakeOpportunityRepository());
    const created = await service.create(
      { tenantId: 'tenant-1', title: 'Plano Pro', value: 5000, pipelineId: 'pipeline-1', stageId: 'stage-1' },
      'relationship-1',
    );

    const moved = await service.move(created.opportunityId, 'stage-2');

    expect(moved.outcome).toBe('Open');
    expect(moved.closedAt).toBeUndefined();
  });
});
