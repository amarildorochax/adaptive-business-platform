import type { BusinessClassification } from "./BusinessClassification.js";
import { BusinessClassificationService } from "./BusinessClassificationService.js";
import type { BusinessProfile } from "./BusinessProfile.js";
import type { BusinessProfileCommand } from "./BusinessProfileCommand.js";
import type { BusinessProfileEvent } from "./BusinessProfileEvent.js";
import type { BusinessProfileLifecycleStage, BusinessProfileLifecycleState } from "./BusinessProfileLifecycleState.js";
import { BusinessProfileLifecycleService } from "./BusinessProfileLifecycleService.js";
import { BusinessProfileService } from "./BusinessProfileService.js";
import { BusinessMaturityService } from "./BusinessMaturityService.js";
import type { CreateBusinessProfilePayload } from "./CreateBusinessProfilePayload.js";
import type { Maturity } from "./Maturity.js";

export interface BusinessProfileManagerDependencies {
  readonly profiles: BusinessProfileService;
  readonly classification: BusinessClassificationService;
  readonly maturity: BusinessMaturityService;
  readonly lifecycle: BusinessProfileLifecycleService;
}

/**
 * Resultado de uma operação de BusinessProfileManager. `command`/`events` estão presentes apenas em
 * `createBusinessProfile` — a única operação desta Sprint cujo Command já está catalogado em
 * `COMMAND_CATALOG.md` (`CreateBusinessProfile`). `EnableCapability`/`DisableCapability` estão
 * catalogados, mas não têm Service produtor nesta Sprint (Capabilities Engine, médio prazo) — mesmo
 * padrão opcional `{result, command?, events?}` já usado por Knowledge Hub (IMP-015) e Integration Hub
 * (IMP-016). Toda transição de estágio sem Command catalogado (`validateProfile`,
 * `finalizeInitialProfile`) retorna apenas `{result}`.
 */
export interface BusinessProfileOperationResult<TEntity> {
  readonly result: TEntity;
  readonly command?: BusinessProfileCommand;
  readonly events?: readonly BusinessProfileEvent[];
}

let commandSequence = 0;
let eventSequence = 0;

function buildCommand(type: BusinessProfileCommand["type"]): BusinessProfileCommand {
  commandSequence += 1;
  return { operationId: `business-profile-cmd-${commandSequence}`, type, requestedAt: new Date() };
}

function buildEvent(type: BusinessProfileEvent["type"]): BusinessProfileEvent {
  eventSequence += 1;
  return { eventId: `business-profile-evt-${eventSequence}`, type, occurredAt: new Date() };
}

/**
 * BusinessProfileManager — implementa o "Profile Manager" (`BUSINESS_PROFILE_ENGINE.md`, Capítulo 7):
 * "o ponto de entrada e o orquestrador central do Engine... coordena os demais componentes
 * especializados e garante que o perfil resultante seja internamente consistente... não classifica
 * segmento, não calcula maturidade e não gera recomendação — sua responsabilidade é orquestração e
 * consistência." Aplica literalmente a Jornada de Construção do Perfil (Capítulo 9), restrita ao
 * escopo curto-prazo (Capítulo 21): Cadastro → Perguntas Iniciais → Classificação → Validação →
 * Perfil Inicial.
 */
export class BusinessProfileManager {
  constructor(private readonly deps: BusinessProfileManagerDependencies) {}

  /**
   * Command "CreateBusinessProfile". Registra o Perfil, avança Cadastro → Perguntas Iniciais →
   * Classificação, e registra a primeira Classificação e a primeira Maturidade — ambas produzidas
   * automaticamente pelo Business Classifier/Segment Engine e pelo Business Maturity Engine a partir
   * do dado já declarado, sem checkpoint humano (esse checkpoint é sempre a etapa seguinte,
   * "Validação", nunca esta).
   */
  async createBusinessProfile(payload: CreateBusinessProfilePayload): Promise<BusinessProfileOperationResult<BusinessProfile>> {
    const profile = await this.deps.profiles.create(payload.tenantId);

    await this.deps.lifecycle.start(profile.profileId);
    await this.deps.lifecycle.advance(profile.profileId, "Perguntas Iniciais");
    await this.deps.lifecycle.advance(profile.profileId, "Classificação");

    await this.deps.classification.classify(profile.profileId, payload.segment, payload.subsegment);
    await this.deps.maturity.assess(profile.profileId, payload.maturity);

    const command = buildCommand("CreateBusinessProfile");
    const events = [buildEvent("BusinessProfileCreated")];

    return { result: profile, command, events };
  }

  /** "Owner confirma ou corrige a classificação sugerida" (Human Validation, Capítulo 5) — nunca automática. */
  async validateProfile(profileId: string): Promise<BusinessProfileOperationResult<BusinessProfileLifecycleState>> {
    const state = await this.deps.lifecycle.advance(profileId, "Validação");
    return { result: state };
  }

  /** "Profile Validator confirma consistência interna; Profile Manager consolida o primeiro estado versionado." */
  async finalizeInitialProfile(profileId: string): Promise<BusinessProfileOperationResult<BusinessProfileLifecycleState>> {
    const state = await this.deps.lifecycle.advance(profileId, "Perfil Inicial");
    return { result: state };
  }

  async findProfile(tenantId: string): Promise<BusinessProfileOperationResult<BusinessProfile | undefined>> {
    return { result: await this.deps.profiles.findByTenantId(tenantId) };
  }

  async currentClassification(profileId: string): Promise<BusinessProfileOperationResult<BusinessClassification | undefined>> {
    return { result: await this.deps.classification.current(profileId) };
  }

  async currentMaturity(profileId: string): Promise<BusinessProfileOperationResult<Maturity | undefined>> {
    return { result: await this.deps.maturity.current(profileId) };
  }

  async currentStage(profileId: string): Promise<BusinessProfileOperationResult<BusinessProfileLifecycleStage | undefined>> {
    return { result: await this.deps.lifecycle.currentStage(profileId) };
  }
}
