// PublicRoute.tsx
//
// Responsabilidade:
// Guard inverso de `ProtectedRoute` — redireciona para `redirectTo`
// quando `isAuthenticated` é verdadeiro (ex.: impedir acesso à tela de
// login enquanto já autenticado). Mesma ressalva: nenhuma lógica de
// autenticação real é implementada aqui.

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

export interface PublicRouteProps {
  children: ReactNode;
  isAuthenticated: boolean;
  redirectTo?: string;
}

export function PublicRoute(props: PublicRouteProps) {
  const { children, isAuthenticated, redirectTo = '/' } = props;

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
