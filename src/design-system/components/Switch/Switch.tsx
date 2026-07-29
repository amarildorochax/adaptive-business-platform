// Switch.tsx
//
// Responsabilidade:
// Componente Switch — estrutura da Sprint 26, identidade visual real
// aplicada na Sprint 29: espaçamento por token e foco visível
// consistente com os demais campos (`.ads-focusable`).

import { spacing } from '../../tokens/spacing';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch(props: SwitchProps) {
  const { checked, onChange, label, disabled } = props;

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: spacing[8], opacity: disabled ? 0.6 : 1 }}>
      <input
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="ads-focusable"
      />
      {label}
    </label>
  );
}
