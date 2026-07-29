/**
 * CRM Authorization Check — a integração declarativa entre o CRM Hub e o Identity Hub (Platform
 * Services): o CRM Manager verifica Permissão através do Identity Hub antes de encaminhar qualquer
 * Comando ao componente especializado correspondente (`CRM_HUB.md`, Capítulo 13).
 * Nenhum tipo de `@abp/platform-services` é importado por este arquivo — toda referência é opaca.
 */
export interface CRMAuthorizationCheck {
  /** Comando cuja autorização está sendo verificada — mesmo valor de CRMCommandType. */
  readonly commandType: string;

  /** Identidade solicitante — identificador opaco, sem redefinir Identity (Platform Services). */
  readonly identityId: string;

  /** Se a operação foi autorizada pelo Identity Hub. */
  readonly authorized: boolean;

  /** Momento da verificação. */
  readonly checkedAt: Date;
}
