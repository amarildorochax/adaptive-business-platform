// LayoutContext.tsx
//
// Responsabilidade:
// Estado puramente visual de densidade de layout (confortável/compacto)
// — preferência de exibição do Shell, não regra de negócio.

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type LayoutDensity = 'comfortable' | 'compact';

export interface LayoutContextValue {
  density: LayoutDensity;
  setDensity: (density: LayoutDensity) => void;
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

export interface LayoutProviderProps {
  children?: ReactNode;
  defaultDensity?: LayoutDensity;
}

export function LayoutProvider(props: LayoutProviderProps) {
  const { children, defaultDensity = 'comfortable' } = props;
  const [density, setDensity] = useState<LayoutDensity>(defaultDensity);

  const value = useMemo<LayoutContextValue>(() => ({ density, setDensity }), [density]);

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayoutContext(): LayoutContextValue {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext deve ser usado dentro de um <LayoutProvider>.');
  }
  return context;
}
