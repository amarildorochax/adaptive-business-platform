// navigationItems.ts
//
// Responsabilidade:
// Contrato de item de navegação consumido pela Sidebar/Navigation do
// Shell. Nenhum item real é declarado aqui — a lista concreta de
// navegação pertence às Sprints que efetivamente conectarão features
// (Sprint 28+).

import type { ReactNode } from 'react';

export interface NavigationItem {
  key: string;
  label: string;
  path: string;
  icon?: ReactNode;
  children?: NavigationItem[];
}
