// ProtectedRoute.tsx
//
// Responsabilidade:
// Guard genérico de rota protegida — redireciona para `redirectTo`
// quando `isAuthenticated` é falso. Não implementa nenhuma lógica de
// autenticação real (proibido pela Sprint 27): `isAuthenticated` deve
// ser calculado e fornecido por quem monta a rota, em uma Sprint futura
// dedicada a Auth. Este componente é apenas o contrato reutilizável.

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

export interface ProtectedRouteProps {
  children: ReactNode;
  isAuthenticated: boolean;
  redirectTo?: string;
}

export function ProtectedRoute(props: ProtectedRouteProps) {
  const { children, isAuthenticated, redirectTo = '/' } = props;

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
