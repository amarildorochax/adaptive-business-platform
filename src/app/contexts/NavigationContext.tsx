// NavigationContext.tsx
//
// Responsabilidade:
// Estado puramente visual de "item de navegação ativo" (destaque na
// Sidebar/Navigation do Shell). Não decide rotas nem duplica o roteador
// — apenas guarda uma chave (`key` de `NavigationItem`) escolhida por
// quem consome este Context.

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export interface NavigationContextValue {
  activeItemKey: string | null;
  setActiveItem: (key: string | null) => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

export interface NavigationProviderProps {
  children?: ReactNode;
  defaultActiveItemKey?: string | null;
}

export function NavigationProvider(props: NavigationProviderProps) {
  const { children, defaultActiveItemKey = null } = props;
  const [activeItemKey, setActiveItem] = useState<string | null>(defaultActiveItemKey);

  const value = useMemo<NavigationContextValue>(
    () => ({ activeItemKey, setActiveItem }),
    [activeItemKey],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigationState(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigationState deve ser usado dentro de um <NavigationProvider>.');
  }
  return context;
}
