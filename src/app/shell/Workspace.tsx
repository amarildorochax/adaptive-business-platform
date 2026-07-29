// Workspace.tsx
//
// Responsabilidade:
// Indicador visual do workspace atual no Shell — lê `useWorkspace` e
// delega a resolução do nome de exibição a quem consome este
// componente (`resolveLabel`), já que este módulo não conhece nenhum
// dado real de workspace.

import { useWorkspace } from '../contexts/WorkspaceContext';

export interface WorkspaceIndicatorProps {
  resolveLabel: (workspaceId: string | null) => string;
}

export function Workspace(props: WorkspaceIndicatorProps) {
  const { resolveLabel } = props;
  const { currentWorkspaceId } = useWorkspace();

  return <span>{resolveLabel(currentWorkspaceId)}</span>;
}
