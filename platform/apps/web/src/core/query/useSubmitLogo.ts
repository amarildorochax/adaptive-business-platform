import { useMutation, useQueryClient } from "@tanstack/react-query";
import { brandingClient } from "../http/clients/brandingClient.js";
import type { BrandThemeResponseDto, LogoResponseDto, SubmitLogoRequestDto } from "../http/dtos/branding.dto.js";

interface BrandIdentityCache {
  readonly theme: BrandThemeResponseDto | undefined;
  readonly logo: LogoResponseDto | undefined;
}

/**
 * `BrandingManager.submitLogo` real (`POST /branding/logos`) — único suporte real de Logo hoje:
 * uma referência de asset (string), nunca um upload de arquivo (`LogoService`/`Logo` não têm
 * nenhum campo de binário/URL processada, ver `packages/branding/src/Logo.ts`). Substitui o Logo já
 * em cache de `useBrandIdentity` sem refazer a consulta.
 */
export function useSubmitLogo(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitLogoRequestDto) => brandingClient.submitLogo(payload),
    onSuccess: (logo) => {
      queryClient.setQueryData<BrandIdentityCache>(["branding", "identity", tenantId], (previous) => ({ theme: previous?.theme, logo }));
    },
  });
}
