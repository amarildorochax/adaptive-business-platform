// FormField.tsx
//
// Responsabilidade:
// Wrapper padrão de campo de formulário (rótulo + controle + erro de
// validação) mais dois controles nativos que o Design System ainda não
// possui (`SelectField`/`TextareaField`) — estilizados com a mesma
// classe `.ads-input` usada por `Input`, herdando borda/raio/cor do
// tema sem nenhum hex novo.

import type { ReactNode } from 'react';
import { Stack, Text } from '@/app/primitives';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children?: ReactNode;
}

export function FormField(props: FormFieldProps) {
  const { label, required, error, children } = props;

  return (
    <Stack gap={4}>
      <Text variant="caption">
        {label}
        {required && <Text as="span" color="var(--ads-color-danger)"> *</Text>}
      </Text>
      {children}
      {error && (
        <Text variant="caption" color="var(--ads-color-danger)">
          {error}
        </Text>
      )}
    </Stack>
  );
}

export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectFieldOption[];
  placeholder?: string;
  error?: boolean;
}

export function SelectField(props: SelectFieldProps) {
  const { value, onChange, options, placeholder = 'Selecione…', error } = props;

  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="ads-input ads-transition"
      style={{ padding: '8px 10px', width: '100%', borderColor: error ? 'var(--ads-color-danger)' : undefined }}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export interface TextareaFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function TextareaField(props: TextareaFieldProps) {
  const { value, onChange, placeholder, rows = 3 } = props;

  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="ads-input ads-transition"
      style={{ padding: '8px 10px', width: '100%', resize: 'vertical' }}
    />
  );
}
