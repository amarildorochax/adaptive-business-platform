/**
 * Consent — o consentimento de comunicação dado por uma parte externa, versionado — toda mudança
 * produz uma nova versão preservável, nunca uma sobrescrita silenciosa (Blueprint, Capítulo 12 e
 * ADR-009). Distinto do Consent Manager de dado pessoal de Usuário já descrito em `IDENTITY_HUB.md`.
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Consent {
  /** Identificador do Consent. */
  readonly consentId: string;

  /** Relationship ao qual este Consent se refere. */
  readonly relationshipId: string;

  /** Número da versão. */
  readonly version: number;

  /** Se o consentimento está concedido nesta versão. */
  readonly granted: boolean;

  /** Escopo do consentimento (ex.: canal específico). */
  readonly scope: string;

  /** Momento de registro desta versão. */
  readonly recordedAt: Date;
}
