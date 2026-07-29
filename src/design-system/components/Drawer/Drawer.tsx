// Drawer.tsx
//
// Responsabilidade:
// Componente Drawer — estrutura da Sprint 26, identidade visual real
// aplicada na Sprint 29: entrada via `.ads-drawer` (slide-up,
// `branding.css`), superfície e sombra por token.

import type { CSSProperties, ReactNode } from 'react';
import { spacing } from '../../tokens/spacing';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: DrawerPosition;
  children?: ReactNode;
}

const POSITION_STYLE: Record<DrawerPosition, CSSProperties> = {
  left: { left: 0, top: 0, bottom: 0 },
  right: { right: 0, top: 0, bottom: 0 },
  top: { top: 0, left: 0, right: 0 },
  bottom: { bottom: 0, left: 0, right: 0 },
};

export function Drawer(props: DrawerProps) {
  const { isOpen, position = 'right', children } = props;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      className="ads-drawer"
      style={{
        position: 'fixed',
        backgroundColor: 'var(--ads-color-background)',
        boxShadow: 'var(--ads-shadow-xl)',
        padding: spacing[24],
        ...POSITION_STYLE[position],
      }}
    >
      {children}
    </div>
  );
}
