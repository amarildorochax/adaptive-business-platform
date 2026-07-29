// Header.tsx
//
// Responsabilidade:
// Estrutura arquitetural do cabeçalho do Shell — botão de
// colapso/expansão da Sidebar e um slot para ações/branding. Sem
// identidade visual definitiva (Sprint 27); apenas a estrutura.

import type { ReactNode } from 'react';
import { Flex } from '../primitives';
import { useSidebar } from '../contexts/SidebarContext';

export interface HeaderProps {
  children?: ReactNode;
}

export function Header(props: HeaderProps) {
  const { children } = props;
  const { collapsed, toggle } = useSidebar();

  return (
    <Flex as="header" align="center" justify="space-between" style={{ width: '100%' }}>
      <button type="button" onClick={toggle} aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}>
        ☰
      </button>
      {children}
    </Flex>
  );
}
