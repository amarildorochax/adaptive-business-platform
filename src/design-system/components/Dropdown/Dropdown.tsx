// Dropdown.tsx
//
// Responsabilidade:
// Componente Dropdown — estrutura da Sprint 26, identidade visual real
// aplicada na Sprint 29: menu com `.ads-card`/`.ads-scale-in`, itens com
// `.ads-list-item` (hover — `branding.css`).

import type { ReactNode } from 'react';
import { spacing } from '../../tokens/spacing';

export interface DropdownItem {
  key: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  onSelect: (key: string) => void;
}

export function Dropdown(props: DropdownProps) {
  const { trigger, items, onSelect } = props;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {trigger}
      <ul
        role="menu"
        className="ads-card ads-scale-in"
        style={{ listStyle: 'none', margin: 0, padding: spacing[4], minWidth: 160 }}
      >
        {items.map((item) => (
          <li key={item.key} role="menuitem">
            <button
              disabled={item.disabled}
              onClick={() => onSelect(item.key)}
              className="ads-list-item ads-transition ads-focusable"
              style={{
                width: '100%',
                textAlign: 'left',
                border: 'none',
                background: 'none',
                padding: `${spacing[8]} ${spacing[12]}`,
                cursor: item.disabled ? 'not-allowed' : 'pointer',
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
