// ClientCard.tsx
//
// Responsabilidade:
// Resumo visual de um `Client` — usado pelas páginas "Clientes" e
// "Contatos" (mesma entidade, ver `types/Client.ts`). Recebe as `Tag`s
// já resolvidas (o hook `useTags` vive fora deste componente).

import { Stack, Flex, Text, Icon } from '@/app/primitives';
import { CRMCard } from './CRMCard';
import { StatusBadge } from './StatusBadge';
import { Tag } from './Tag';
import type { Client } from '../types/Client';
import type { Tag as TagEntity } from '../types/Tag';

export interface ClientCardProps {
  client: Client;
  companyName?: string;
  tags?: TagEntity[];
}

export function ClientCard(props: ClientCardProps) {
  const { client, companyName, tags = [] } = props;

  return (
    <CRMCard title={client.name} action={<StatusBadge status={client.status} />}>
      <Stack gap={8}>
        <Text variant="caption" color="var(--ads-color-text-secondary)">
          {client.role}
          {companyName ? ` · ${companyName}` : ''}
        </Text>
        <Flex align="center" gap={8}>
          <Icon name="info" size={14} />
          <Text variant="caption">{client.email}</Text>
        </Flex>
        <Flex align="center" gap={8}>
          <Icon name="user" size={14} />
          <Text variant="caption">{client.phone}</Text>
        </Flex>
        {tags.length > 0 && (
          <Flex gap={4} wrap>
            {tags.map((tag) => (
              <Tag key={tag.id} tag={tag} />
            ))}
          </Flex>
        )}
      </Stack>
    </CRMCard>
  );
}
