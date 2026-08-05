/**
 * Business Profile Lifecycle State — os cinco estágios curto-prazo da Jornada de Construção do Perfil
 * (`BUSINESS_PROFILE_ENGINE.md`, Capítulo 9): Cadastro → Perguntas Iniciais → Classificação →
 * Validação → Perfil Inicial. Os estágios subsequentes do diagrama completo do Capítulo 9 —
 * Configuração Automática, Aprendizado Contínuo, Revisões — dependem do Adaptive Rules Engine, do
 * Configuration Generator e do Recommendation Engine, todos explicitamente médio/longo prazo per o
 * Roadmap do próprio Blueprint (Capítulo 21) — nunca incluídos nesta união fechada, para não
 * antecipar funcionalidade futura (ver `BUSINESS_PROFILE_ENGINE_CORE_MIGRATION_REPORT.md`).
 */
export type BusinessProfileLifecycleStage = "Cadastro" | "Perguntas Iniciais" | "Classificação" | "Validação" | "Perfil Inicial";

export interface BusinessProfileLifecycleState {
  /** Business Profile ao qual este estado se refere. */
  readonly profileId: string;

  /** Estágio atual da Jornada. */
  readonly stage: BusinessProfileLifecycleStage;

  /** Momento em que o Perfil entrou neste estágio. */
  readonly enteredAt: Date;
}
