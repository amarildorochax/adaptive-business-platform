export interface UpdatePalettePayload {
  readonly tenantId: string;
  readonly themeId: string;
  readonly primaryColorHex: string;
  readonly backgroundHex: string;
}
