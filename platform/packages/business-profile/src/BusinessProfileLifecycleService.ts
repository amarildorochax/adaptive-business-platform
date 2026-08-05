import type { BusinessProfileLifecycleStage, BusinessProfileLifecycleState } from "./BusinessProfileLifecycleState.js";
import type { BusinessProfileLifecycleStateRepository } from "./BusinessProfileLifecycleStateRepository.js";

/**
 * Business Profile Lifecycle Service — administra a Jornada de Construção do Perfil
 * (`BUSINESS_PROFILE_ENGINE.md`, Capítulo 9), restrita aos cinco estágios curto-prazo: Cadastro →
 * Perguntas Iniciais → Classificação → Validação → Perfil Inicial. "Classificação" é alcançado
 * automaticamente, pelo próprio sistema (Business Classifier + Business Maturity Engine), sem
 * checkpoint humano; "Validação" é sempre um gate humano explícito ("Owner confirma ou corrige a
 * classificação sugerida", princípio Human Validation) — nunca disparado automaticamente por nenhuma
 * outra transição, mesma disciplina de guarda de estágio já usada em `KnowledgeLifecycleService`
 * (IMP-015).
 */
const ALLOWED_TRANSITIONS: Record<BusinessProfileLifecycleStage, readonly BusinessProfileLifecycleStage[]> = {
  Cadastro: ["Perguntas Iniciais"],
  "Perguntas Iniciais": ["Classificação"],
  Classificação: ["Validação"],
  Validação: ["Perfil Inicial"],
  "Perfil Inicial": [],
};

export class BusinessProfileLifecycleService {
  constructor(private readonly repository: BusinessProfileLifecycleStateRepository) {}

  async start(profileId: string): Promise<BusinessProfileLifecycleState> {
    return this.record(profileId, "Cadastro");
  }

  async advance(profileId: string, next: BusinessProfileLifecycleStage): Promise<BusinessProfileLifecycleState> {
    const current = await this.currentStage(profileId);
    if (!current) {
      throw new Error(`Business Profile "${profileId}" ainda não iniciou sua Jornada de Construção.`);
    }

    if (!ALLOWED_TRANSITIONS[current].includes(next)) {
      throw new Error(`Transição inválida de "${current}" para "${next}" em "${profileId}".`);
    }

    return this.record(profileId, next);
  }

  async currentStage(profileId: string): Promise<BusinessProfileLifecycleStage | undefined> {
    const states = await this.repository.listByProfileId(profileId);
    return states[states.length - 1]?.stage;
  }

  async history(profileId: string): Promise<readonly BusinessProfileLifecycleState[]> {
    return this.repository.listByProfileId(profileId);
  }

  private async record(profileId: string, stage: BusinessProfileLifecycleStage): Promise<BusinessProfileLifecycleState> {
    const state: BusinessProfileLifecycleState = { profileId, stage, enteredAt: new Date() };
    return this.repository.create(state);
  }
}
