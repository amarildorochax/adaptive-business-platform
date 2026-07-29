// Footer.tsx
//
// Responsabilidade:
// Estrutura arquitetural do rodapé do Shell — apenas um slot de
// conteúdo, sem identidade visual definitiva.

import type { ReactNode } from 'react';

export interface FooterProps {
  children?: ReactNode;
}

export function Footer(props: FooterProps) {
  const { children } = props;
  return <footer>{children}</footer>;
}
