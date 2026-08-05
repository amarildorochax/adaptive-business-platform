import type { Audience } from '../Audience';
import type { AudienceRepository } from '../AudienceRepository';
import type { AudienceSegment } from '../AudienceSegment';
import type { AudienceSegmentRepository } from '../AudienceSegmentRepository';
import type { Campaign } from '../Campaign';
import type { CampaignGoal } from '../CampaignGoal';
import type { CampaignGoalRepository } from '../CampaignGoalRepository';
import type { CampaignRepository } from '../CampaignRepository';
import type { ConversionEvent } from '../ConversionEvent';
import type { ConversionEventRepository } from '../ConversionEventRepository';
import type { ConversionGoal } from '../ConversionGoal';
import type { ConversionGoalRepository } from '../ConversionGoalRepository';
import type { LeadSource } from '../LeadSource';
import type { LeadSourceRepository } from '../LeadSourceRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-005, Etapa 9). Mesmo padrão já usado por
 * `@abp/crm-hub` (IMP-002), `@abp/communication-hub` (IMP-003) e `@abp/content-hub` (IMP-004) —
 * nunca exportados pelo barrel do pacote, nunca referenciados por nenhum Service em produção.
 */

export class FakeCampaignRepository implements CampaignRepository {
  private readonly rows = new Map<string, Campaign>();
  async create(campaign: Campaign) {
    this.rows.set(campaign.campaignId, campaign);
    return campaign;
  }
  async update(campaign: Campaign) {
    this.rows.set(campaign.campaignId, campaign);
    return campaign;
  }
  async get(campaignId: string) {
    return this.rows.get(campaignId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((c) => c.tenantId === tenantId);
  }
}

export class FakeCampaignGoalRepository implements CampaignGoalRepository {
  private readonly rows = new Map<string, CampaignGoal>();
  async create(campaignGoal: CampaignGoal) {
    this.rows.set(campaignGoal.campaignGoalId, campaignGoal);
    return campaignGoal;
  }
  async get(campaignGoalId: string) {
    return this.rows.get(campaignGoalId);
  }
  async list(campaignId: string) {
    return [...this.rows.values()].filter((g) => g.campaignId === campaignId);
  }
}

export class FakeAudienceRepository implements AudienceRepository {
  private readonly rows = new Map<string, Audience>();
  async create(audience: Audience) {
    this.rows.set(audience.audienceId, audience);
    return audience;
  }
  async get(audienceId: string) {
    return this.rows.get(audienceId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((a) => a.tenantId === tenantId);
  }
}

export class FakeAudienceSegmentRepository implements AudienceSegmentRepository {
  private readonly rows = new Map<string, AudienceSegment>();
  async create(segment: AudienceSegment) {
    this.rows.set(segment.audienceSegmentId, segment);
    return segment;
  }
  async update(segment: AudienceSegment) {
    this.rows.set(segment.audienceSegmentId, segment);
    return segment;
  }
  async get(audienceSegmentId: string) {
    return this.rows.get(audienceSegmentId);
  }
  async findByCriterion(audienceId: string, criterion: string) {
    return [...this.rows.values()].find((s) => s.audienceId === audienceId && s.criterion === criterion);
  }
  async list(audienceId: string) {
    return [...this.rows.values()].filter((s) => s.audienceId === audienceId);
  }
}

export class FakeLeadSourceRepository implements LeadSourceRepository {
  private readonly rows = new Map<string, LeadSource>();
  async create(leadSource: LeadSource) {
    this.rows.set(leadSource.leadSourceId, leadSource);
    return leadSource;
  }
  async get(leadSourceId: string) {
    return this.rows.get(leadSourceId);
  }
  async list() {
    return [...this.rows.values()];
  }
}

export class FakeConversionGoalRepository implements ConversionGoalRepository {
  private readonly rows = new Map<string, ConversionGoal>();
  async create(conversionGoal: ConversionGoal) {
    this.rows.set(conversionGoal.conversionGoalId, conversionGoal);
    return conversionGoal;
  }
  async get(conversionGoalId: string) {
    return this.rows.get(conversionGoalId);
  }
  async list() {
    return [...this.rows.values()];
  }
}

export class FakeConversionEventRepository implements ConversionEventRepository {
  private readonly rows: ConversionEvent[] = [];
  async create(conversionEvent: ConversionEvent) {
    this.rows.push(conversionEvent);
    return conversionEvent;
  }
  async get(conversionEventId: string) {
    return this.rows.find((e) => e.conversionEventId === conversionEventId);
  }
  async listByGoal(conversionGoalId: string) {
    return this.rows.filter((e) => e.conversionGoalId === conversionGoalId);
  }
}
