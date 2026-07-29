// ContentArea.tsx
//
// Responsabilidade:
// Área de conteúdo principal do Shell — wrapper semântico `<main>`.

import type { ReactNode } from 'react';

export interface ContentAreaProps {
  children?: ReactNode;
}

export function ContentArea(props: ContentAreaProps) {
  const { children } = props;
  return <main id="main-content">{children}</main>;
}
