import { describe, expect, it } from 'vitest';
import { AudienceService } from './AudienceService';
import { AudienceSegmentService } from './AudienceSegmentService';
import { CampaignGoalService } from './CampaignGoalService';
import { CampaignService } from './CampaignService';
import { ConversionEventService } from './ConversionEventService';
import { ConversionGoalService } from './ConversionGoalService';
import { GrowthManager } from './GrowthManager';
import { LeadSourceService } from './LeadSourceService';
import {
  FakeAudienceRepository,
  FakeAudienceSegmentRepository,
  FakeCampaignGoalRepository,
  FakeCampaignRepository,
  FakeConversionEventRepository,
  FakeConversionGoalRepository,
  FakeLeadSourceRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  return new GrowthManager({
    campaigns: new CampaignService(new FakeCampaignRepository()),
    campaignGoals: new CampaignGoalService(new FakeCampaignGoalRepository()),
    audiences: new AudienceService(new FakeAudienceRepository()),
    audienceSegments: new AudienceSegmentService(new FakeAudienceSegmentRepository()),
    leadSources: new LeadSourceService(new FakeLeadSourceRepository()),
    conversionGoals: new ConversionGoalService(new FakeConversionGoalRepository()),
    conversionEvents: new ConversionEventService(new FakeConversionEventRepository()),
  });
}

describe('GrowthManager — Marketing/Growth Core', () => {
  it('createAudience produz o Command CreateAudience e o Event AudienceBuilt', async () => {
    const manager = buildManager();

    const operation = await manager.createAudience({
      tenantId: 'tenant-1',
      memberReferenceIds: ['customer-1', 'customer-2'],
      estimatedReach: 2,
    });

    expect(operation.command?.type).toBe('CreateAudience');
    expect(operation.events.map((e) => e.type)).toEqual(['AudienceBuilt']);
  });

  it('createCampaign exige uma Audience já construída (CampaignRequiresAudienceBeforeStart aplicada também na criação)', async () => {
    const manager = buildManager();

    await expect(
      manager.createCampaign({
        tenantId: 'tenant-1',
        audienceId: 'audience-inexistente',
        name: 'Campanha',
        description: undefined,
        startDate: undefined,
        endDate: undefined,
      }),
    ).rejects.toThrow();
  });

  it('createCampaign produz o Command CreateCampaign e o Event CampaignCreated quando a Audience existe', async () => {
    const manager = buildManager();
    const { result: audience } = await manager.createAudience({
      tenantId: 'tenant-1',
      memberReferenceIds: ['customer-1'],
      estimatedReach: undefined,
    });

    const operation = await manager.createCampaign({
      tenantId: 'tenant-1',
      audienceId: audience.audienceId,
      name: 'Campanha de Lançamento',
      description: undefined,
      startDate: undefined,
      endDate: undefined,
    });

    expect(operation.result.status).toBe('Created');
    expect(operation.command?.type).toBe('CreateCampaign');
    expect(operation.events.map((e) => e.type)).toEqual(['CampaignCreated']);
  });

  it('startCampaign valida CampaignRequiresAudienceBeforeStart e produz CampaignStarted', async () => {
    const manager = buildManager();
    const { result: audience } = await manager.createAudience({
      tenantId: 'tenant-1',
      memberReferenceIds: ['customer-1'],
      estimatedReach: undefined,
    });
    const { result: campaign } = await manager.createCampaign({
      tenantId: 'tenant-1',
      audienceId: audience.audienceId,
      name: 'Campanha',
      description: undefined,
      startDate: undefined,
      endDate: undefined,
    });

    const operation = await manager.startCampaign(campaign.campaignId);

    expect(operation.result.status).toBe('Running');
    expect(operation.command?.type).toBe('StartCampaign');
    expect(operation.events.map((e) => e.type)).toEqual(['CampaignStarted']);
  });

  it('stopCampaign produz o Command StopCampaign mas nenhum Event — CampaignFinished não tem produtor de Core nesta Sprint', async () => {
    const manager = buildManager();
    const { result: audience } = await manager.createAudience({
      tenantId: 'tenant-1',
      memberReferenceIds: ['customer-1'],
      estimatedReach: undefined,
    });
    const { result: campaign } = await manager.createCampaign({
      tenantId: 'tenant-1',
      audienceId: audience.audienceId,
      name: 'Campanha',
      description: undefined,
      startDate: undefined,
      endDate: undefined,
    });
    await manager.startCampaign(campaign.campaignId);

    const operation = await manager.stopCampaign(campaign.campaignId);

    expect(operation.result.status).toBe('Stopped');
    expect(operation.command?.type).toBe('StopCampaign');
    expect(operation.events).toEqual([]);
  });

  it('updateSegment produz o Command UpdateSegment e o Event SegmentUpdated', async () => {
    const manager = buildManager();
    const { result: audience } = await manager.createAudience({
      tenantId: 'tenant-1',
      memberReferenceIds: ['customer-1'],
      estimatedReach: undefined,
    });

    const operation = await manager.updateSegment(audience.audienceId, 'alto-valor');

    expect(operation.result.criterion).toBe('alto-valor');
    expect(operation.command?.type).toBe('UpdateSegment');
    expect(operation.events.map((e) => e.type)).toEqual(['SegmentUpdated']);
  });

  it('registerConversion exige um Conversion Goal existente e produz RegisterConversion/ConversionRegistered', async () => {
    const manager = buildManager();
    const { result: goal } = await manager.createConversionGoal('Assinatura anual concluída');

    const operation = await manager.registerConversion(goal.conversionGoalId, 'campaign-1');

    expect(operation.result.conversionGoalId).toBe(goal.conversionGoalId);
    expect(operation.command?.type).toBe('RegisterConversion');
    expect(operation.events.map((e) => e.type)).toEqual(['ConversionRegistered']);
  });

  it('createCampaignGoal, createLeadSource e createConversionGoal nunca carregam Command nem emitem Event — nenhum está aprovado para essas três Entidades de apoio', async () => {
    const manager = buildManager();
    const { result: audience } = await manager.createAudience({
      tenantId: 'tenant-1',
      memberReferenceIds: ['customer-1'],
      estimatedReach: undefined,
    });
    const { result: campaign } = await manager.createCampaign({
      tenantId: 'tenant-1',
      audienceId: audience.audienceId,
      name: 'Campanha',
      description: undefined,
      startDate: undefined,
      endDate: undefined,
    });

    const campaignGoal = await manager.createCampaignGoal(campaign.campaignId, 'Gerar 50 novos Leads');
    const leadSource = await manager.createLeadSource('Instagram Ads');
    const conversionGoal = await manager.createConversionGoal('Compra concluída');

    expect(campaignGoal.command).toBeUndefined();
    expect(campaignGoal.events).toEqual([]);
    expect(leadSource.command).toBeUndefined();
    expect(leadSource.events).toEqual([]);
    expect(conversionGoal.command).toBeUndefined();
    expect(conversionGoal.events).toEqual([]);
  });
});
