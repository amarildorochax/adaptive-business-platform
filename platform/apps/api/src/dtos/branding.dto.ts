/** DTOs da camada HTTP para Branding — nunca `Logo`/`DesignToken`/`BrandTheme` de `@abp/branding` usados diretamente. */

export interface SubmitLogoRequestDto {
  readonly tenantId: string;
  readonly assetReference: string;
}

export interface LogoResponseDto {
  readonly logoId: string;
  readonly tenantId: string;
  readonly assetReference: string;
  readonly uploadedAt: string;
}

export interface GenerateBrandThemeRequestDto {
  readonly tenantId: string;
  readonly primaryColorHex: string;
  readonly backgroundHex: string;
  readonly titleFont: string;
  readonly bodyFont: string;
}

export interface UpdatePaletteRequestDto {
  readonly tenantId: string;
  readonly themeId: string;
  readonly primaryColorHex: string;
  readonly backgroundHex: string;
}

export interface DesignTokenResponseDto {
  readonly tokenId: string;
  readonly tenantId: string;
  readonly themeId: string;
  readonly category: string;
  readonly name: string;
  readonly value: string;
}

export interface BrandThemeResponseDto {
  readonly themeId: string;
  readonly tenantId: string;
  readonly version: number;
  readonly generatedAt: string;
}

export interface BrandIdentityResponseDto {
  readonly theme: BrandThemeResponseDto;
  readonly tokens: readonly DesignTokenResponseDto[];
}

export interface BusinessContextResponseDto {
  readonly segment?: string;
  readonly subsegment?: string;
  readonly maturity?: string;
}
