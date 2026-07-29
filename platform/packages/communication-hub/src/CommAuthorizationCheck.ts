/**
 * Communication Authorization Check — a integração declarativa entre o Communication Hub e o
 * Identity Hub (Platform Services): toda operação de Command e de Query é verificada através do
 * Identity Hub antes de ser encaminhada ao componente especializado correspondente
 * (`COMMUNICATION_HUB.md`, Capítulo 13).
 * Nenhum tipo de `@abp/platform-services` é importado por este arquivo — toda referência é opaca.
 */
export interface CommAuthorizationCheck {
  /** Comando ou Query cuja autorização está sendo verificada — mesmo valor de CommCommandType/CommQueryType. */
  readonly operationType: string;

  /** Identidade solicitante — identificador opaco, sem redefinir Identity (Platform Services). */
  readonly identityId: string;

  /** Se a operação foi autorizada pelo Identity Hub. */
  readonly authorized: boolean;

  /** Momento da verificação. */
  readonly checkedAt: Date;
}
