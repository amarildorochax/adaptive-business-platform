export type ThemeName = "dark" | "light";

/**
 * Preferência de tema — `localStorage`, nunca `sessionStorage` (diferente da credencial de sessão de
 * `core/auth/`, ver `AuthProvider.tsx`): esta é uma preferência de UI sem valor de segurança,
 * corretamente persistida entre sessões do navegador. Tema escuro é o padrão oficial (UX-001) —
 * ausência de preferência salva nunca é lida do sistema operacional (`prefers-color-scheme`), sempre
 * resolve para `"dark"`.
 */
const STORAGE_KEY = "abp.theme";

function storageAvailable(): boolean {
  return typeof localStorage !== "undefined";
}

export function loadTheme(): ThemeName {
  if (!storageAvailable()) {
    return "dark";
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" ? "light" : "dark";
}

export function saveTheme(theme: ThemeName): void {
  if (!storageAvailable()) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, theme);
}
