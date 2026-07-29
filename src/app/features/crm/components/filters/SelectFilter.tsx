// SelectFilter.tsx
//
// Responsabilidade:
// Filtro genérico de valor único (rótulo + `<select>`) — base para
// `StatusFilter`/`OwnerFilter`/`CompanyFilter`/`PeriodFilter`. Usa
// `<select>` nativo (o Design System não define um componente Select
// próprio) estilizado com a classe `.ads-input` já usada por `Input`,
// mantendo a mesma borda/raio/cor — nenhum hex novo.

import { Stack, Text } from '@/app/primitives';

export interface SelectFilterOption {
  value: string;
  label: string;
}

export interface SelectFilterProps {
  label: string;
  value: string;
  options: SelectFilterOption[];
  onChange: (value: string) => void;
  allLabel?: string;
}

export function SelectFilter(props: SelectFilterProps) {
  const { label, value, options, onChange, allLabel = 'Todos' } = props;

  return (
    <Stack gap={4}>
      <Text variant="caption" color="var(--ads-color-text-auxiliary)">
        {label}
      </Text>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="ads-input ads-transition"
        style={{ padding: '8px 10px', minWidth: 160 }}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Stack>
  );
}
