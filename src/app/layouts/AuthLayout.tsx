// AuthLayout.tsx
//
// Responsabilidade:
// Layout para telas de autenticação (login/cadastro/recuperação) —
// sem Header/Sidebar/Footer, apenas um cartão centralizado. Nenhuma
// lógica de autenticação é implementada aqui (proibido pela Sprint 27).

import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Flex, Surface, Container } from '../primitives';

export interface AuthLayoutProps {
  children?: ReactNode;
}

export function AuthLayout(props: AuthLayoutProps) {
  const { children } = props;

  return (
    <Flex align="center" justify="center" style={{ minHeight: '100vh' }}>
      <Container maxWidth="tablet">
        <Surface elevation="lg" rounded="lg" style={{ padding: '32px' }}>
          {children ?? <Outlet />}
        </Surface>
      </Container>
    </Flex>
  );
}
