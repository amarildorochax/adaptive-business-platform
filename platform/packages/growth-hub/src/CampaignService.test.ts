import { describe, expect, it } from 'vitest';
import { CampaignService } from './CampaignService';
import { FakeCampaignRepository } from './testing/InMemoryFakes';

describe('CampaignService', () => {
  it('cria uma Campaign sempre no estado Created', async () => {
    const service = new CampaignService(new FakeCampaignRepository());

    const campaign = await service.create({
      tenantId: 'tenant-1',
      audienceId: 'audience-1',
      name: 'Campanha de Dia das Mães',
      description: undefined,
      startDate: undefined,
      endDate: undefined,
    });

    expect(campaign.status).toBe('Created');
  });

  it('start transiciona para Running', async () => {
    const service = new CampaignService(new FakeCampaignRepository());
    const created = await service.create({
      tenantId: 'tenant-1',
      audienceId: 'audience-1',
      name: 'Campanha',
      description: undefined,
      startDate: undefined,
      endDate: undefined,
    });

    const started = await service.start(created.campaignId);

    expect(started.status).toBe('Running');
  });

  it('stop transiciona para Stopped, nunca para Finished', async () => {
    const service = new CampaignService(new FakeCampaignRepository());
    const created = await service.create({
      tenantId: 'tenant-1',
      audienceId: 'audience-1',
      name: 'Campanha',
      description: undefined,
      startDate: undefined,
      endDate: undefined,
    });
    await service.start(created.campaignId);

    const stopped = await service.stop(created.campaignId);

    expect(stopped.status).toBe('Stopped');
  });
});
