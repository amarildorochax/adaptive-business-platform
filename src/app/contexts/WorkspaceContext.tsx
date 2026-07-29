// WorkspaceContext.tsx
//
// Responsabilidade:
// Estado puramente visual de "workspace atual" (ex.: qual espaço de
// trabalho está selecionado na UI). Não busca, não valida e não conhece
// nenhum dado real de workspace vindo do Core — apenas guarda um
// identificador de string escolhido por quem consome este Context.

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export interface WorkspaceContextValue {
  currentWorkspaceId: string | null;
  setWorkspace: (workspaceId: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export interface WorkspaceProviderProps {
  children?: ReactNode;
  defaultWorkspaceId?: string | null;
}

export function WorkspaceProvider(props: WorkspaceProviderProps) {
  const { children, defaultWorkspaceId = null } = props;
  const [currentWorkspaceId, setWorkspace] = useState<string | null>(defaultWorkspaceId);

  const value = useMemo<WorkspaceContextValue>(
    () => ({ currentWorkspaceId, setWorkspace }),
    [currentWorkspaceId],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace deve ser usado dentro de um <WorkspaceProvider>.');
  }
  return context;
}
