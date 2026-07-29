// ClientDetailPage.tsx
//
// Responsabilidade:
// Página de detalhe de um Cliente/Contato — dados cadastrais, empresa,
// contato, etiquetas, observações, timeline, negócios, atividades e
// agenda, todos filtrados a partir das listas completas já carregadas
// pela página-mãe (`ClientsPage`), sem novas chamadas de rede.

import { Stack, Flex, Grid, Text, Heading, Divider } from '@/app/primitives';
import { Button } from '@/design-system/components';
import { CRMCard, StatusBadge, Tag, DealCard, ActivityItem, Timeline } from '../components';
import type { Client } from '../types/Client';
import type { Company } from '../types/Company';
import type { Deal } from '../types/Deal';
import type { Activity } from '../types/Activity';
import type { AgendaEvent } from '../types/AgendaEvent';
import type { Note } from '../types/Note';
import type { HistoryEntry } from '../types/HistoryEntry';
import type { Tag as TagEntity } from '../types/Tag';

export interface ClientDetailPageProps {
  client: Client;
  company?: Company;
  tags: TagEntity[];
  deals: Deal[];
  activities: Activity[];
  agendaEvents: AgendaEvent[];
  notes: Note[];
  history: HistoryEntry[];
  onBack: () => void;
  onEdit: () => void;
}

export function ClientDetailPage(props: ClientDetailPageProps) {
  const { client, company, tags, deals, activities, agendaEvents, notes, history, onBack, onEdit } = props;

  return (
    <Stack gap={20}>
      <Flex justify="space-between" align="center">
        <Button variant="neutral" size="sm" onClick={onBack}>
          ← Voltar
        </Button>
        <Button variant="primary" size="sm" onClick={onEdit}>
          Editar Cliente
        </Button>
      </Flex>

      <CRMCard>
        <Stack gap={12}>
          <Flex justify="space-between" align="center" wrap>
            <Heading level={2} variant="heading">
              {client.name}
            </Heading>
            <StatusBadge status={client.status} />
          </Flex>

          <Text variant="body" color="var(--ads-color-text-secondary)">
            {client.role}
            {company ? ` · ${company.name}` : ''}
          </Text>

          <Grid columns={2} gap={8} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <Text variant="caption">E-mail: {client.email}</Text>
            <Text variant="caption">Telefone: {client.phone}</Text>
            <Text variant="caption">WhatsApp: {client.whatsapp}</Text>
            <Text variant="caption">Origem: {client.source || '—'}</Text>
            <Text variant="caption">Responsável: {client.salesOwnerName || '—'}</Text>
            <Text variant="caption">Cadastrado em: {new Date(client.createdAt).toLocaleDateString('pt-BR')}</Text>
          </Grid>

          {tags.length > 0 && (
            <Flex gap={4} wrap>
              {tags.map((tag) => (
                <Tag key={tag.id} tag={tag} />
              ))}
            </Flex>
          )}
        </Stack>
      </CRMCard>

      <Grid columns={2} gap={20} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'start' }}>
        <CRMCard title="Negócios">
          {deals.length === 0 ? (
            <Text variant="caption" color="var(--ads-color-text-auxiliary)">
              Nenhum negócio vinculado.
            </Text>
          ) : (
            <Stack gap={12}>
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </Stack>
          )}
        </CRMCard>

        <CRMCard title="Atividades">
          {activities.length === 0 ? (
            <Text variant="caption" color="var(--ads-color-text-auxiliary)">
              Nenhuma atividade registrada.
            </Text>
          ) : (
            <Stack gap={4}>
              {activities.map((activity, index) => (
                <Stack key={activity.id} gap={4}>
                  <ActivityItem activity={activity} />
                  {index < activities.length - 1 && <Divider />}
                </Stack>
              ))}
            </Stack>
          )}
        </CRMCard>

        <CRMCard title="Agenda">
          {agendaEvents.length === 0 ? (
            <Text variant="caption" color="var(--ads-color-text-auxiliary)">
              Nenhum evento agendado.
            </Text>
          ) : (
            <Stack gap={8}>
              {agendaEvents.map((event) => (
                <Flex key={event.id} justify="space-between">
                  <Text variant="caption">{event.title}</Text>
                  <Text variant="caption" color="var(--ads-color-text-auxiliary)">
                    {new Date(event.date).toLocaleDateString('pt-BR')} {event.time}
                  </Text>
                </Flex>
              ))}
            </Stack>
          )}
        </CRMCard>

        <CRMCard title="Observações">
          {notes.length === 0 ? (
            <Text variant="caption" color="var(--ads-color-text-auxiliary)">
              Nenhuma observação registrada.
            </Text>
          ) : (
            <Stack gap={12}>
              {notes.map((note) => (
                <Stack key={note.id} gap={2}>
                  <Text variant="caption">{note.content}</Text>
                  <Text variant="caption" color="var(--ads-color-text-auxiliary)">
                    {note.author} · {new Date(note.createdAt).toLocaleString('pt-BR')}
                  </Text>
                </Stack>
              ))}
            </Stack>
          )}
        </CRMCard>
      </Grid>

      <CRMCard title="Histórico">
        <Timeline entries={history} />
      </CRMCard>
    </Stack>
  );
}
