/**
 * Template Resolution — o registro de que o Template Engine resolveu, para uma Action que produz
 * comunicação, o Template e a identidade de marca apropriados, consumindo o Template Manager e o
 * Theme Manager já descritos em `BRANDING_HUB.md`, sem duplicar essa responsabilidade dentro do
 * Automation Engine (`AUTOMATION_ENGINE.md`, Capítulo 14).
 * `templateReferenceId` é sempre opaco — nenhum tipo do Branding Hub é importado.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export interface TemplateResolution {
  /** Identificador da Template Resolution. */
  readonly templateResolutionId: string;

  /** Action de comunicação à qual esta resolução se refere — ver Action.ts (Sprint 6.3). */
  readonly actionId: string;

  /** Referência opaca ao Template resolvido pelo Branding Hub — nunca um tipo importado. */
  readonly templateReferenceId: string;

  /** Momento da resolução. */
  readonly resolvedAt: Date;
}
