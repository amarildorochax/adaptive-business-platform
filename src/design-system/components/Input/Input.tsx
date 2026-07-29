// Input.tsx
//
// Responsabilidade:
// Componente Input — estrutura da Sprint 26, identidade visual real
// aplicada na Sprint 29: classe `.ads-input` (borda, raio, foco visível
// — `branding.css`), padding/fonte por tamanho, borda de erro semântica.

import type { ComponentSize } from '../../types/component';
import { PADDING_BY_SIZE, FONT_SIZE_BY_SIZE } from '../../foundations/branding';

export interface InputProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: ComponentSize;
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  onChange?: (value: string) => void;
}

export function Input(props: InputProps) {
  const { value, defaultValue, placeholder, disabled, error, size = 'md', type = 'text', onChange } = props;

  return (
    <input
      type={type}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.value)}
      className="ads-input ads-transition"
      style={{
        padding: PADDING_BY_SIZE[size],
        fontSize: FONT_SIZE_BY_SIZE[size],
        borderColor: error ? 'var(--ads-color-danger)' : undefined,
      }}
    />
  );
}
