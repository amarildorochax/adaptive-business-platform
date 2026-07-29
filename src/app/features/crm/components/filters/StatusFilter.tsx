// StatusFilter.tsx
//
// Responsabilidade:
// Filtro por status — recebe o vocabulário de status (rótulos já
// traduzidos) da página chamadora, já que `ClientStatus`/
// `CrmRecordStatus`/`ActivityStatus` são vocabulários diferentes.

import { SelectFilter } from './SelectFilter';

export interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function StatusFilter(props: StatusFilterProps) {
  const { value, onChange, options } = props;
  return <SelectFilter label="Status" value={value} onChange={onChange} options={options} allLabel="Todos os status" />;
}
