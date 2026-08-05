/**
 * Branding Event — os três Eventos já catalogados em `EVENT_CATALOG.md`, seção "Branding Hub"
 * (`ThemeUpdated`, `BrandAssetChanged`, `BrandPaletteUpdated`). Mesma disciplina de declarar o
 * catálogo completo já aplicada a `BrandingCommand.ts`.
 */
export type BrandingEventType = "ThemeUpdated" | "BrandAssetChanged" | "BrandPaletteUpdated";

export interface BrandingEvent {
  /** Identificador do Evento. */
  readonly eventId: string;

  /** Tipo do Evento. */
  readonly type: BrandingEventType;

  /** Momento em que o Fato ocorreu. */
  readonly occurredAt: Date;
}
