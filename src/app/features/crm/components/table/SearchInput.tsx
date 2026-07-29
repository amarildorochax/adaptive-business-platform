// SearchInput.tsx
//
// Responsabilidade:
// Campo de pesquisa instantânea reutilizável — sem debounce (filtra
// direto sobre um array em memória, já rápido o suficiente sem
// backend).

import { Input } from '@/design-system/components';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput(props: SearchInputProps) {
  const { value, onChange, placeholder = 'Pesquisar…' } = props;
  return <Input type="search" value={value} onChange={onChange} placeholder={placeholder} />;
}
