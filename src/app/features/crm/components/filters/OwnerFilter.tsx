// OwnerFilter.tsx
//
// Responsabilidade:
// Filtro por responsável — as opções são derivadas pela página a partir
// dos nomes distintos já presentes nos dados (nenhuma lista fixa de
// usuários existe nesta Sprint).

import { SelectFilter } from './SelectFilter';

export interface OwnerFilterProps {
  value: string;
  onChange: (value: string) => void;
  owners: string[];
}

export function OwnerFilter(props: OwnerFilterProps) {
  const { value, onChange, owners } = props;
  return (
    <SelectFilter
      label="Responsável"
      value={value}
      onChange={onChange}
      options={owners.map((owner) => ({ value: owner, label: owner }))}
      allLabel="Todos os responsáveis"
    />
  );
}
