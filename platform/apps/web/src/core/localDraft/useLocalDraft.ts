import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@core/auth/useAuth";
import { clearLocalDraft, loadLocalDraft, saveLocalDraft } from "./localDraftStorage";

const AUTOSAVE_DEBOUNCE_MS = 600;

/**
 * Rascunho local com autosave visual, genérico por módulo — generalizado na FUN-102 a partir de
 * `core/businessProfile/useProfileDraft.ts` (FUN-101, primeiro uso). Debounce de 600ms antes de
 * gravar em `localStorage`; `savedAt` alimenta o indicador visual "Rascunho salvo às HH:MM"
 * (`DraftSavedIndicator`).
 */
export function useLocalDraft<T extends Record<string, unknown>>(module: string, section: string, initialValue: T) {
  const { tenantId } = useAuth();
  const [value, setValue] = useState<T>(() => loadLocalDraft<T>(module, tenantId ?? "", section) ?? initialValue);
  const [savedAt, setSavedAt] = useState<Date | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Ver `useProfileDraft.ts` original (FUN-101) — recarrega o rascunho correto assim que `tenantId`
  // chegar, para o caso deste hook ser montado antes de `tenantId` estar disponível.
  useEffect(() => {
    if (tenantId) {
      const stored = loadLocalDraft<T>(module, tenantId, section);
      if (stored) {
        setValue(stored);
      }
    }
  }, [module, tenantId, section]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const updateField = useCallback(
    <K extends keyof T>(key: K, fieldValue: T[K]) => {
      setValue((current) => {
        const next = { ...current, [key]: fieldValue };

        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          saveLocalDraft(module, tenantId ?? "", section, next);
          setSavedAt(new Date());
        }, AUTOSAVE_DEBOUNCE_MS);

        return next;
      });
    },
    [module, tenantId, section],
  );

  const resetDraft = useCallback(() => {
    clearLocalDraft(module, tenantId ?? "", section);
    setValue(initialValue);
    setSavedAt(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module, tenantId, section]);

  return { value, updateField, savedAt, resetDraft };
}
