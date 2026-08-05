import { apiClient } from "../client.js";
import type {
  BrandIdentityResponseDto,
  BrandThemeResponseDto,
  BusinessContextResponseDto,
  DesignTokenResponseDto,
  GenerateBrandThemeRequestDto,
  LogoResponseDto,
  SubmitLogoRequestDto,
  UpdatePaletteRequestDto,
} from "../dtos/branding.dto.js";
import { undefinedOn404 } from "../undefinedOn404.js";

/** Cliente HTTP de Branding — espelha `apps/api/src/routes/branding.ts` (FUN-004), rota a rota. */
export const brandingClient = {
  submitLogo(payload: SubmitLogoRequestDto): Promise<LogoResponseDto> {
    return apiClient.post("/branding/logos", payload);
  },

  currentLogo(tenantId: string): Promise<LogoResponseDto | undefined> {
    return undefinedOn404(() => apiClient.get(`/branding/logos/${encodeURIComponent(tenantId)}`));
  },

  generateInitialBrandIdentity(payload: GenerateBrandThemeRequestDto): Promise<BrandIdentityResponseDto> {
    return apiClient.post("/branding/identity", payload);
  },

  regenerateTheme(payload: GenerateBrandThemeRequestDto): Promise<BrandIdentityResponseDto> {
    return apiClient.post("/branding/theme", payload);
  },

  updatePalette(payload: UpdatePaletteRequestDto): Promise<readonly DesignTokenResponseDto[]> {
    return apiClient.post("/branding/palette", payload);
  },

  currentTheme(tenantId: string): Promise<BrandThemeResponseDto | undefined> {
    return undefinedOn404(() => apiClient.get(`/branding/theme/${encodeURIComponent(tenantId)}`));
  },

  businessContext(profileId: string): Promise<BusinessContextResponseDto> {
    return apiClient.get(`/branding/context/${encodeURIComponent(profileId)}`);
  },
};
