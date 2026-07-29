/**
 * Lifecycle Stage — modela a etapa de crescimento em que um Cliente se encontra (ex.: recém-
 * adquirido, ativado, retido, em expansão), distinto do Stage de uma Opportunity do CRM Hub, que
 * mede progressão comercial pontual, não maturidade de crescimento.
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export type GrowthLifecycleStage = "NewlyAcquired" | "Activated" | "Retained" | "Expanding";

export interface LifecycleStage {
  /** Referência opaca ao Cliente — nunca uma cópia de Customer do CRM Hub. */
  readonly customerReferenceId: string;

  /** Estágio atual de crescimento. */
  readonly stage: GrowthLifecycleStage;

  /** Momento da última transição. */
  readonly updatedAt: Date;
}
