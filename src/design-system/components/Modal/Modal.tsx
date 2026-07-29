// Modal.tsx
//
// Responsabilidade:
// Componente Modal — estrutura da Sprint 26, identidade visual real
// aplicada na Sprint 29: overlay com fade-in, painel com scale-in
// (`.ads-modal-overlay`/`.ads-modal` — `branding.css`), respeitando
// `prefers-reduced-motion`. Sprint 31D: overlay usa `--ads-color-scrim`
// (token estático) em vez de hex fixo.

import type { ReactNode } from 'react';
import { spacing } from '../../tokens/spacing';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
}

export function Modal(props: ModalProps) {
  const { isOpen, onClose, title, children } = props;

  if (!isOpen) return null;

  return (
    <div
      className="ads-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--ads-color-scrim)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="ads-modal"
        style={{ padding: spacing[24] }}
        onClick={(event) => event.stopPropagation()}
      >
        {title && <strong>{title}</strong>}
        {children}
      </div>
    </div>
  );
}
