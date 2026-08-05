import type { Audience } from './Audience';
import { AudienceService, type BuildAudienceInput } from './AudienceService';
import type { AudienceSegment } from './AudienceSegment';
import { AudienceSegmentService } from './AudienceSegmentService';
import type { Campaign } from './Campaign';
import { CampaignService, type CreateCampaignInput } from './CampaignService';
import type { CampaignGoal } from './CampaignGoal';
import { CampaignGoalService } from './CampaignGoalService';
import type { ConversionEvent } from './ConversionEvent';
import { ConversionEventService } from './ConversionEventService';
import type { ConversionGoal } from './ConversionGoal';
import { ConversionGoalService } from './ConversionGoalService';
import type { GrowthCommand, GrowthCommandType } from './GrowthCommand';
import type { GrowthEvent, GrowthEventType } from './GrowthEvent';
import type { LeadSource } from './LeadSource';
import { LeadSourceService } from './LeadSourceService';

export interface GrowthManagerDependencies {
  readonly campaigns: CampaignService;
  readonly campaignGoals: CampaignGoalService;
  readonly audiences: AudienceService;
  readonly audienceSegments: AudienceSegmentService;
  readonly leadSources: LeadSourceService;
  readonly conversionGoals: ConversionGoalService;
  readonly conversionEvents: ConversionEventService;
}

/**
 * Resultado de uma operação de GrowthManager — a Entidade produzida, todo Event já aprovado
 * consequente, e o Command que a originou, quando a operação corresponde a um dos dezesseis Commands
 * já aprovados em `GrowthCommand.ts`. `command` é `undefined` para Campaign Goal, Lead Source e
 * Conversion Goal — nenhum dos dezesseis Commands cobre a criação dessas três Entidades de apoio
 * (mesmo tratamento já dado a Organization/Contact em `CRMOperationResult`, IMP-002).
 */
export interface GrowthOperationResult<TEntity> {
  readonly result: TEntity;
  readonly command?: GrowthCommand;
  readonly events: readonly GrowthEvent[];
}

/**
 * GrowthManager — o componente "Growth Manager" já catalogado em `GrowthHubComponent.ts`,
 * implementado pela primeira vez nesta Sprint (IMP-005, Marketing Core). Nomeado `GrowthManager`, não
 * `MarketingManager`, pelo mesmo motivo já registrado em IMP-003 (`CommunicationManager`, não
 * `ConversationManager`): "Marketing Hub" e "Growth Hub" são o mesmo Bounded Context
 * (`MARKETING_HUB_ARCHITECTURE.md`/BP-009), e o catálogo de componentes já aprovado usa o segundo
 * nome.
 *
 * Escopo desta Sprint (Marketing/Growth Core): apenas o ciclo de vida de Campaign, Audience/Audience
 * Segment, Lead Source e Conversion — nunca Journey, Experiment, Attribution, Referral, Cohort,
 * Growth Insight/Recommendation/Initiative/Opportunity, todos explicitamente fora de escopo (ver
 * relatório desta Sprint).
 *
 * Nunca contém, ele mesmo, regra de negócio de uma Entidade específica — mesma disciplina de
 * fronteira já demonstrada por `src/core/campaign/CampaignManager.ts` (real e funcional, adaptado ao
 * vocabulário e à forma já aprovados pelo Blueprint). Não publica em nenhum Event Bus — `GrowthEvent`
 * é retornado ao chamador, mesmo padrão já em uso por `CRMManager`/`CommunicationManager`.
 */
export class GrowthManager {
  constructor(private readonly deps: GrowthManagerDependencies) {}

  async createCampaign(input: CreateCampaignInput): Promise<GrowthOperationResult<Campaign>> {
    const audience = await this.deps.audiences.get(input.audienceId);

    if (!audience) {
      throw new Error(`Audience ${input.audienceId} não encontrada — Campaign exige uma Audience já construída.`);
    }

    const campaign = await this.deps.campaigns.create(input);

    return {
      result: campaign,
      command: this.command('CreateCampaign'),
      events: [this.event('CampaignCreated')],
    };
  }

  /**
   * Inicia uma Campaign. Verifica a regra de negócio `CampaignRequiresAudienceBeforeStart`
   * (`GrowthBusinessRule.ts`) consultando o AudienceRepository — nunca confia apenas em `audienceId`
   * estar preenchido no tipo, verifica que a Audience referenciada de fato existe.
   */
  async startCampaign(campaignId: string): Promise<GrowthOperationResult<Campaign>> {
    const existing = await this.deps.campaigns.get(campaignId);

    if (!existing) {
      throw new Error(`Campaign ${campaignId} não encontrada.`);
    }

    const audience = await this.deps.audiences.get(existing.audienceId);

    if (!audience) {
      throw new Error(
        `Campaign ${campaignId} não pode iniciar: Audience ${existing.audienceId} não encontrada (CampaignRequiresAudienceBeforeStart).`,
      );
    }

    const campaign = await this.deps.campaigns.start(campaignId);

    return {
      result: campaign,
      command: this.command('StartCampaign'),
      events: [this.event('CampaignStarted')],
    };
  }

  /**
   * Encerra uma Campaign em execução (`StopCampaign`, Command aprovado). Nenhum Event aprovado
   * corresponde a esta transição — `CampaignFinished` existe no catálogo (`GrowthEvent.ts`), mas
   * nenhum dos dezesseis Commands aprovados o produz nesta Sprint; permanece catalogado sem produtor
   * de Core, lacuna documentada no relatório desta Sprint (mesmo tratamento já dado a
   * `ArticleFlaggedForUpdate` em IMP-004).
   */
  async stopCampaign(campaignId: string): Promise<GrowthOperationResult<Campaign>> {
    const campaign = await this.deps.campaigns.stop(campaignId);

    return {
      result: campaign,
      command: this.command('StopCampaign'),
      events: [],
    };
  }

  /** Nenhum Command/Event aprovado cobre Campaign Goal — ver Nota de Posicionamento do relatório desta Sprint. */
  async createCampaignGoal(campaignId: string, description: string): Promise<GrowthOperationResult<CampaignGoal>> {
    const campaignGoal = await this.deps.campaignGoals.create(campaignId, description);
    return { result: campaignGoal, events: [] };
  }

  async createAudience(input: BuildAudienceInput): Promise<GrowthOperationResult<Audience>> {
    const audience = await this.deps.audiences.build(input);

    return {
      result: audience,
      command: this.command('CreateAudience'),
      events: [this.event('AudienceBuilt')],
    };
  }

  /**
   * Recalcula um Audience Segment por critério. `UpdateSegment` (Command aprovado) cobre tanto a
   * primeira composição quanto todo recálculo — não existe um Command "CreateSegment" separado no
   * catálogo já Frozen.
   */
  async updateSegment(audienceId: string, criterion: string): Promise<GrowthOperationResult<AudienceSegment>> {
    const audience = await this.deps.audiences.get(audienceId);

    if (!audience) {
      throw new Error(`Audience ${audienceId} não encontrada.`);
    }

    const segment = await this.deps.audienceSegments.recompute(audienceId, criterion);

    return {
      result: segment,
      command: this.command('UpdateSegment'),
      events: [this.event('SegmentUpdated')],
    };
  }

  /** Nenhum Command/Event aprovado cobre Lead Source — ver Nota de Posicionamento do relatório desta Sprint. */
  async createLeadSource(name: string): Promise<GrowthOperationResult<LeadSource>> {
    const leadSource = await this.deps.leadSources.create(name);
    return { result: leadSource, events: [] };
  }

  /** Nenhum Command/Event aprovado cobre Conversion Goal — ver Nota de Posicionamento do relatório desta Sprint. */
  async createConversionGoal(description: string): Promise<GrowthOperationResult<ConversionGoal>> {
    const conversionGoal = await this.deps.conversionGoals.create(description);
    return { result: conversionGoal, events: [] };
  }

  /**
   * Registra um Conversion Event. Regra `ConversionsPreserveHistory` (`GrowthBusinessRule.ts`)
   * garantida estruturalmente por `ConversionEventRepository` nunca expor `update`/`remove`.
   */
  async registerConversion(conversionGoalId: string, sourceId?: string): Promise<GrowthOperationResult<ConversionEvent>> {
    const conversionGoal = await this.deps.conversionGoals.get(conversionGoalId);

    if (!conversionGoal) {
      throw new Error(`Conversion Goal ${conversionGoalId} não encontrado.`);
    }

    const conversionEvent = await this.deps.conversionEvents.register(conversionGoalId, sourceId);

    return {
      result: conversionEvent,
      command: this.command('RegisterConversion'),
      events: [this.event('ConversionRegistered')],
    };
  }

  private command(type: GrowthCommandType): GrowthCommand {
    return { operationId: crypto.randomUUID(), type, requestedAt: new Date() };
  }

  private event(type: GrowthEventType): GrowthEvent {
    return { eventId: crypto.randomUUID(), type, occurredAt: new Date() };
  }
}
