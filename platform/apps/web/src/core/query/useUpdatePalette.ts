import { useMutation, useQueryClient } from "@tanstack/react-query";
import { brandingClient } from "../http/clients/brandingClient.js";
import type { DemoSnapshot } from "../managers/seedDemoData";
import type { UpdatePaletteRequestDto } from "../http/dtos/branding.dto.js";

/**
 * Command "UpdatePalette" real (`POST /branding/palette`) — precondição "paleta anterior existente"
 * já verificada pelo próprio `BrandingManager` (rejeita com erro caso não haja). A resposta HTTP
 * devolve apenas os dois novos Tokens de categoria "Cor" recém-criados: o Repository de Design
 * Tokens é imutável (sem update/remove, ver `DesignTokenRepository`), então o Backend nunca
 * descarta os tokens de cor anteriores — apenas não existe nenhum endpoint para listar o histórico
 * completo (limitação documentada no relatório desta Sprint). Por isso, do ponto de vista deste
 * Frontend, os dois tokens devolvidos substituem localmente os tokens de categoria "Cor" já em
 * cache — os de "Tipografia" (não afetados por esta Command) permanecem intactos.
 */
export function useUpdatePalette() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePaletteRequestDto) => brandingClient.updatePalette(payload),
    onSuccess: (newColorTokens) => {
      queryClient.setQueryData<DemoSnapshot>(["dashboard", "bootstrap"], (previous) =>
        previous ? { ...previous, brandTokens: [...previous.brandTokens.filter((token) => token.category !== "Cor"), ...newColorTokens] } : previous,
      );
    },
  });
}
