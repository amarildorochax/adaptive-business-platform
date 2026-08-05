/**
 * Rascunho local por seção de um módulo — `localStorage`, nunca uma chamada de rede. Generalizado na
 * FUN-102 a partir de `core/businessProfile/profileDraftStorage.ts` (FUN-101, primeiro uso) para ser
 * reutilizado por qualquer módulo com o mesmo cenário: campos pedidos por uma Sprint que ainda não
 * têm endpoint real. Nunca apresentado como sincronizado com o servidor — cada consumidor exibe
 * `NotConnectedNotice` ao lado de qualquer campo apoiado por este armazenamento.
 *
 * Chave por `module` + `tenantId` + seção — formato idêntico ao já usado por Business Profile
 * (`abp.businessProfile.draft.*`), preservando compatibilidade com rascunhos já salvos.
 */
function storageKey(module: string, tenantId: string, section: string): string {
  return `abp.${module}.draft.${tenantId}.${section}`;
}

function storageAvailable(): boolean {
  return typeof localStorage !== "undefined";
}

export function loadLocalDraft<T>(module: string, tenantId: string, section: string): T | undefined {
  if (!storageAvailable()) {
    return undefined;
  }

  const raw = localStorage.getItem(storageKey(module, tenantId, section));
  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function saveLocalDraft<T>(module: string, tenantId: string, section: string, value: T): void {
  if (!storageAvailable()) {
    return;
  }
  localStorage.setItem(storageKey(module, tenantId, section), JSON.stringify(value));
}

export function clearLocalDraft(module: string, tenantId: string, section: string): void {
  if (!storageAvailable()) {
    return;
  }
  localStorage.removeItem(storageKey(module, tenantId, section));
}
