// CompanyCard.tsx
//
// Responsabilidade:
// Resumo visual de uma `Company` — usado pela página "Empresas".

import { Stack, Flex, Text, Icon } from '@/app/primitives';
import { CRMCard } from './CRMCard';
import { StatusBadge } from './StatusBadge';
import type { Company } from '../types/Company';

const SIZE_LABEL: Record<Company['size'], string> = {
  micro: 'Microempresa',
  pequena: 'Pequena empresa',
  media: 'Média empresa',
  grande: 'Grande empresa',
};

export interface CompanyCardProps {
  company: Company;
}

export function CompanyCard(props: CompanyCardProps) {
  const { company } = props;

  return (
    <CRMCard title={company.name} action={<StatusBadge status={company.status} />}>
      <Stack gap={8}>
        <Text variant="caption" color="var(--ads-color-text-secondary)">
          {company.tradeName} · {SIZE_LABEL[company.size]}
        </Text>
        <Text variant="caption" color="var(--ads-color-text-auxiliary)">
          {company.segment} · {company.city}/{company.state}
        </Text>
        <Flex align="center" gap={8}>
          <Icon name="user" size={14} />
          <Text variant="caption">{company.ownerName}</Text>
        </Flex>
        <Flex align="center" gap={8}>
          <Icon name="info" size={14} />
          <Text variant="caption">{company.email}</Text>
        </Flex>
      </Stack>
    </CRMCard>
  );
}
