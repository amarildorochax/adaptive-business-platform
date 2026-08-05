import type { BrandTheme, DesignToken, Logo } from "@abp/branding";
import type { BusinessClassification, Maturity } from "@abp/business-profile";
import type { BrandThemeResponseDto, BusinessContextResponseDto, DesignTokenResponseDto, LogoResponseDto } from "../dtos/branding.dto.js";

export function toLogoResponseDto(logo: Logo): LogoResponseDto {
  return { logoId: logo.logoId, tenantId: logo.tenantId, assetReference: logo.assetReference, uploadedAt: logo.uploadedAt.toISOString() };
}

export function toDesignTokenResponseDto(token: DesignToken): DesignTokenResponseDto {
  return { tokenId: token.tokenId, tenantId: token.tenantId, themeId: token.themeId, category: token.category, name: token.name, value: token.value };
}

export function toBrandThemeResponseDto(theme: BrandTheme): BrandThemeResponseDto {
  return { themeId: theme.themeId, tenantId: theme.tenantId, version: theme.version, generatedAt: theme.generatedAt.toISOString() };
}

export function toBusinessContextResponseDto(context: { readonly classification: BusinessClassification | undefined; readonly maturity: Maturity | undefined }): BusinessContextResponseDto {
  return { segment: context.classification?.segment, subsegment: context.classification?.subsegment, maturity: context.maturity };
}
