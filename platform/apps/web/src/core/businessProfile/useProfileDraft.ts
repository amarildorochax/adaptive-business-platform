import { useLocalDraft } from "@core/localDraft/useLocalDraft";

/**
 * Rascunho local com autosave visual (FUN-101) — para seções do Perfil Empresarial cujos campos não
 * têm endpoint real. Desde a FUN-102, um fino wrapper sobre `useLocalDraft` (genérico por módulo,
 * generalizado a partir deste hook — primeiro uso, e agora também usado por `pages/branding/`),
 * preservando a mesma chave de `localStorage` (`abp.businessProfile.draft.*`) e a mesma API pública.
 */
export function useProfileDraft<T extends Record<string, unknown>>(section: string, initialValue: T) {
  return useLocalDraft<T>("businessProfile", section, initialValue);
}
