// Tabs.tsx
//
// Responsabilidade:
// Componente Tabs — estrutura da Sprint 26, identidade visual real
// aplicada na Sprint 29: aba ativa destacada via `.ads-list-item` com
// `data-active` (`branding.css`), transição suave.

import { spacing } from '../../tokens/spacing';
import type { ReactNode } from 'react';

export interface TabItem {
  key: string;
  label: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs(props: TabsProps) {
  const { items, activeKey, onChange } = props;

  return (
    <div role="tablist" style={{ display: 'flex', gap: spacing[8], borderBottom: '1px solid var(--ads-color-border)' }}>
      {items.map((item) => (
        <button
          key={item.key}
          role="tab"
          aria-selected={item.key === activeKey}
          data-active={item.key === activeKey}
          onClick={() => onChange(item.key)}
          className="ads-list-item ads-transition ads-focusable"
          style={{ border: 'none', background: 'none', padding: `${spacing[8]} ${spacing[12]}`, cursor: 'pointer' }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
