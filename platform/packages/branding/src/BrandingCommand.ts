/**
 * Branding Command — os três Commands já catalogados em `COMMAND_CATALOG.md`, seção "Branding Hub"
 * (`UpdateTheme`, `PublishBrandAssets`, `UpdatePalette`). Mesma disciplina já aplicada por
 * `CommerceEvent.ts` (IMP-006) e `BusinessProfileCommand.ts` (IMP-018): declarar o catálogo completo,
 * ainda que apenas um subconjunto de operações desta Sprint os produza — ver
 * `BRANDING_HUB_CORE_MIGRATION_REPORT.md`, "Decisões Arquiteturais", para a leitura literal de
 * precondição que determina exatamente quando cada um se aplica.
 */
export type BrandingCommandType = "UpdateTheme" | "PublishBrandAssets" | "UpdatePalette";

export interface BrandingCommand {
  /** Identificador de operação, único por execução — garante Idempotência. */
  readonly operationId: string;

  /** Tipo do Comando. */
  readonly type: BrandingCommandType;

  /** Momento em que o Comando foi recebido pelo Brand Manager. */
  readonly requestedAt: Date;
}
