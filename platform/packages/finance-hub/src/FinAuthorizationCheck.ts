/**
 * Finance Authorization Check — a integração declarativa entre o Finance Hub e o Identity Hub
 * (Platform Services): toda operação sobre Invoice, Payment e demais Entidades financeiras é
 * verificada através do Identity Hub antes de ser encaminhada ao componente especializado
 * correspondente (`FINANCE_HUB.md`, Capítulo 13).
 * Nenhum tipo de `@abp/platform-services` é importado por este arquivo — toda referência é opaca.
 */
export interface FinAuthorizationCheck {
  /** Comando ou Query cuja autorização está sendo verificada — mesmo valor de FinCommandType/FinQueryType. */
  readonly operationType: string;

  /** Identidade solicitante — identificador opaco, sem redefinir Identity (Platform Services). */
  readonly identityId: string;

  /** Se a operação foi autorizada pelo Identity Hub. */
  readonly authorized: boolean;

  /** Momento da verificação. */
  readonly checkedAt: Date;
}
