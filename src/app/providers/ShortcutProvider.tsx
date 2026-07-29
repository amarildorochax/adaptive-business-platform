// ShortcutProvider.tsx
//
// Responsabilidade:
// Registro global de atalhos de teclado. Componentes registram um
// combo (ex.: "ctrl+k") e um callback via `useShortcut`; o Provider
// escuta `keydown` uma única vez no documento e despacha para o
// callback registrado correspondente.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ShortcutHandler = (event: KeyboardEvent) => void;

export interface ShortcutContextValue {
  register: (combo: string, handler: ShortcutHandler) => () => void;
}

const ShortcutContext = createContext<ShortcutContextValue | undefined>(undefined);

function normalizeCombo(event: KeyboardEvent): string {
  const parts: string[] = [];
  if (event.ctrlKey || event.metaKey) parts.push('ctrl');
  if (event.shiftKey) parts.push('shift');
  if (event.altKey) parts.push('alt');
  parts.push(event.key.toLowerCase());
  return parts.join('+');
}

export interface ShortcutProviderProps {
  children?: ReactNode;
}

export function ShortcutProvider(props: ShortcutProviderProps) {
  const { children } = props;
  const [handlersByCombo, setHandlersByCombo] = useState<Record<string, ShortcutHandler[]>>({});
  const handlersRef = useRef(handlersByCombo);
  handlersRef.current = handlersByCombo;

  const register = useCallback((combo: string, handler: ShortcutHandler) => {
    const key = combo.toLowerCase();
    setHandlersByCombo((prev) => ({ ...prev, [key]: [...(prev[key] ?? []), handler] }));

    return () => {
      setHandlersByCombo((prev) => ({
        ...prev,
        [key]: (prev[key] ?? []).filter((registered) => registered !== handler),
      }));
    };
  }, []);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      const combo = normalizeCombo(event);
      handlersRef.current[combo]?.forEach((handler) => handler(event));
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, []);

  const value = useMemo<ShortcutContextValue>(() => ({ register }), [register]);

  return <ShortcutContext.Provider value={value}>{children}</ShortcutContext.Provider>;
}

export function useShortcut(combo: string, handler: ShortcutHandler): void {
  const context = useContext(ShortcutContext);
  if (!context) {
    throw new Error('useShortcut deve ser usado dentro de um <ShortcutProvider>.');
  }

  useEffect(() => context.register(combo, handler), [context, combo, handler]);
}
