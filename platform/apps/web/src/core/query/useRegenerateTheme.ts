import { useMutation, useQueryClient } from "@tanstack/react-query";
import { brandingClient } from "../http/clients/brandingClient.js";
import type { DemoSnapshot } from "../managers/seedDemoData";
import type { BrandThemeResponseDto, GenerateBrandThemeRequestDto, LogoResponseDto } from "../http/dtos/branding.dto.js";

interface BrandIdentityCache {
  readonly theme: BrandThemeResponseDto | undefined;
  readonly logo: LogoResponseDto | undefined;
}

/**
 * Command "UpdateTheme" real (`POST /branding/theme`) — regeneração completa (ADR-012: "nunca
 * incremental sobre o estado anterior"), um novo `themeId`/versão e o conjunto inteiro de Tokens
 * (Cor + Tipografia) recriado do zero. Diferente de `useUpdatePalette`, aqui a resposta já é a
 * fotografia completa e correta do novo Theme — substitui integralmente `brandTokens` em cache
 * (nunca um merge parcial) e também o Theme já em cache de `useBrandIdentity` (`["branding",
 * "identity", tenantId]`), preservando o Logo eventualmente já carregado nesse mesmo cache.
 */
export function useRegenerateTheme(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateBrandThemeRequestDto) => brandingClient.regenerateTheme(payload),
    onSuccess: ({ theme, tokens }) => {
      queryClient.setQueryData<DemoSnapshot>(["dashboard", "bootstrap"], (previous) => (previous ? { ...previous, brandTokens: tokens } : previous));
      queryClient.setQueryData<BrandIdentityCache>(["branding", "identity", tenantId], (previous) => ({ theme, logo: previous?.logo }));
    },
  });
}
