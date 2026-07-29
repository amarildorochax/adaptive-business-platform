/**
 * Analytics Authorization Check — a integração declarativa entre o Analytics Hub e o Identity Hub
 * (Platform Services): toda operação sobre Dashboard, Report e demais Entidades é verificada através
 * do Identity Hub antes de ser encaminhada ao componente especializado correspondente
 * (`ANALYTICS_HUB.md`, Capítulo 13).
 * Nenhum tipo de `@abp/platform-services` é importado por este arquivo — toda referência é opaca.
 */
export interface AnalyticsAuthorizationCheck {
  /** Comando ou Query cuja autorização está sendo verificada — mesmo valor de AnalyticsCommandType/AnalyticsQueryType. */
  readonly operationType: string;

  /** Identidade solicitante — identificador opaco, sem redefinir Identity (Platform Services). */
  readonly identityId: string;

  /** Se a operação foi autorizada pelo Identity Hub. */
  readonly authorized: boolean;

  /** Momento da verificação. */
  readonly checkedAt: Date;
}
