// PeriodFilter.tsx
//
// Responsabilidade:
// Filtro por período — presets relativos à data atual (sem seletor de
// calendário nesta Sprint, fora do ESCOPO). Usado por Agenda/Atividades.

import { SelectFilter } from './SelectFilter';

export type PeriodFilterValue = 'all' | 'overdue' | 'today' | 'upcoming';

const OPTIONS: { value: PeriodFilterValue; label: string }[] = [
  { value: 'overdue', label: 'Atrasados' },
  { value: 'today', label: 'Hoje' },
  { value: 'upcoming', label: 'Próximos dias' },
];

export interface PeriodFilterProps {
  value: PeriodFilterValue | '';
  onChange: (value: PeriodFilterValue | '') => void;
}

export function PeriodFilter(props: PeriodFilterProps) {
  const { value, onChange } = props;
  return (
    <SelectFilter
      label="Período"
      value={value}
      onChange={(next) => onChange(next as PeriodFilterValue | '')}
      options={OPTIONS}
      allLabel="Todo o período"
    />
  );
}
