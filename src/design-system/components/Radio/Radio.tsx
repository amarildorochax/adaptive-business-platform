// Radio.tsx
//
// Responsabilidade:
// Componente Radio — estrutura da Sprint 26, identidade visual real
// aplicada na Sprint 29: espaçamento por token e foco visível
// consistente com os demais campos (`.ads-focusable`).

import { spacing } from '../../tokens/spacing';

export interface RadioProps {
  checked: boolean;
  onChange: (value: string) => void;
  name: string;
  value: string;
  label?: string;
  disabled?: boolean;
}

export function Radio(props: RadioProps) {
  const { checked, onChange, name, value, label, disabled } = props;

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: spacing[8], opacity: disabled ? 0.6 : 1 }}>
      <input
        type="radio"
        checked={checked}
        name={name}
        value={value}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="ads-focusable"
      />
      {label}
    </label>
  );
}
