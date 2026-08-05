/** Preferência de Sidebar recolhida/expandida — `localStorage`, mesma categoria de preferência de UI que `core/theme/themeStorage.ts` (nunca uma credencial, nunca `sessionStorage`). */
const STORAGE_KEY = "abp.sidebar.collapsed";

function storageAvailable(): boolean {
  return typeof localStorage !== "undefined";
}

export function loadSidebarCollapsed(): boolean {
  if (!storageAvailable()) {
    return false;
  }
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function saveSidebarCollapsed(collapsed: boolean): void {
  if (!storageAvailable()) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, String(collapsed));
}
