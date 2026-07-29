// SidebarContext.tsx
//
// Responsabilidade:
// Estado puramente visual de colapso/expansão da Sidebar do Shell.
// Nenhuma regra de negócio — apenas um booleano e seu alternador.

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export interface SidebarProviderProps {
  children?: ReactNode;
  defaultCollapsed?: boolean;
}

export function SidebarProvider(props: SidebarProviderProps) {
  const { children, defaultCollapsed = false } = props;
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const value = useMemo<SidebarContextValue>(
    () => ({ collapsed, setCollapsed, toggle: () => setCollapsed((prev) => !prev) }),
    [collapsed],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar deve ser usado dentro de um <SidebarProvider>.');
  }
  return context;
}
