// CompanyFilter.tsx
//
// Responsabilidade:
// Filtro por empresa — usado pela página de Clientes/Contatos e pela de
// Negócios.

import { SelectFilter } from './SelectFilter';
import type { Company } from '../../types/Company';

export interface CompanyFilterProps {
  value: string;
  onChange: (value: string) => void;
  companies: Company[];
}

export function CompanyFilter(props: CompanyFilterProps) {
  const { value, onChange, companies } = props;
  return (
    <SelectFilter
      label="Empresa"
      value={value}
      onChange={onChange}
      options={companies.map((company) => ({ value: company.id, label: company.name }))}
      allLabel="Todas as empresas"
    />
  );
}
