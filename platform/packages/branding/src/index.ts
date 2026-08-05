/**
 * Barrel export do pacote @abp/branding.
 * Criado do zero pela IMP-019 (Branding Hub Core) — nenhum scaffolding prévio existia; o único
 * achado da auditoria de legado (`src/design-system/foundations/branding/`) é um falso-amigo — o
 * design system interno da própria Adaptive Business Platform, não um sistema de branding por tenant
 * (ver `BRANDING_HUB_CORE_MIGRATION_REPORT.md`, Auditoria de Legado). Pacote dedicado, distinto de
 * `@abp/platform-services` — Branding Hub pertence à categoria arquitetural "Adaptive Intelligence"
 * (`DOMAIN_OWNERSHIP_MATRIX.md`, linha 276: "Adaptive Intelligence: AI · Business Profile ·
 * Branding"), com dependência oficial de `@abp/business-profile` (Capítulo 12, integração
 * unidirecional).
 */
export * from './AccessibilityValidatorService';
export * from './BrandingCommand';
export * from './BrandingEvent';
export * from './BrandingManager';
export * from './BrandTheme';
export * from './BrandThemeRepository';
export * from './BrandThemeService';
export * from './DesignToken';
export * from './DesignTokenRepository';
export * from './DesignTokenService';
export * from './GenerateBrandThemePayload';
export * from './Logo';
export * from './LogoRepository';
export * from './LogoService';
export * from './TokenCategory';
export * from './UpdatePalettePayload';
