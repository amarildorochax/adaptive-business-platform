/**
 * Template (Message Template) — modelo reutilizável de Message, resolvido em conjunto com o
 * Branding Hub para aplicação de identidade e tom; versionado — toda mudança relevante produz uma
 * nova versão preservável (Blueprint, Capítulo 12).
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Template {
  /** Identificador do Template. */
  readonly templateId: string;

  /** Tenant ao qual este Template pertence. */
  readonly tenantId: string;

  /** Nome do Template. */
  readonly name: string;

  /** Número da versão. */
  readonly version: number;
}
