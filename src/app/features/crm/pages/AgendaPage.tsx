// AgendaPage.tsx
//
// Responsabilidade:
// Agenda do CRM (Sprint 33) — visualização em lista agrupada por
// período (Atrasados / Hoje / Próximos dias), com cadastro de evento.

import { useMemo, useState } from 'react';
import { Stack, Flex, Text } from '@/app/primitives';
import { Button, Loading, EmptyState, Badge } from '@/design-system/components';
import { CRMCard, NewAgendaModal } from '../components';
import type { AgendaFormValues } from '../components';
import { useAgenda } from '../hooks/useAgenda';
import { useClients } from '../hooks/useClients';
import { useLocalCollection, generateId } from '../workspace';
import type { AgendaEvent, AgendaEventType } from '../types/AgendaEvent';

const TYPE_LABEL: Record<AgendaEventType, string> = {
  appointment: 'Compromisso',
  callback: 'Retorno',
  'follow-up': 'Follow-up',
  meeting: 'Reunião',
  reminder: 'Lembrete',
};

function startOfToday(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function eventDay(event: AgendaEvent): number {
  const [year, month, day] = event.date.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1).getTime();
}

interface AgendaGroup {
  key: string;
  title: string;
  events: AgendaEvent[];
}

export function AgendaPage() {
  const agendaQuery = useAgenda();
  const clientsQuery = useClients();
  const agenda = useLocalCollection(agendaQuery.data);

  const [modal, setModal] = useState<{ event?: AgendaEvent } | null>(null);

  const loading = agendaQuery.loading || clientsQuery.loading;

  const groups = useMemo<AgendaGroup[]>(() => {
    const today = startOfToday();
    const sorted = [...agenda.items].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

    return [
      { key: 'overdue', title: 'Atrasados', events: sorted.filter((event) => eventDay(event) < today) },
      { key: 'today', title: 'Hoje', events: sorted.filter((event) => eventDay(event) === today) },
      { key: 'upcoming', title: 'Próximos dias', events: sorted.filter((event) => eventDay(event) > today) },
    ];
  }, [agenda.items]);

  function handleCreate(values: AgendaFormValues) {
    agenda.add({ id: generateId('agenda'), externalCalendarId: null, dealId: null, ...values });
  }

  if (loading) {
    return <Loading label="Carregando agenda…" />;
  }

  return (
    <Stack gap={20}>
      <Flex justify="space-between" align="center">
        <Text variant="body" style={{ fontWeight: 600 }}>
          {agenda.items.length} {agenda.items.length === 1 ? 'evento' : 'eventos'}
        </Text>
        <Button variant="primary" size="sm" onClick={() => setModal({})}>
          Novo Evento
        </Button>
      </Flex>

      {groups.map((group) => (
        <Stack key={group.key} gap={8}>
          <Flex align="center" gap={8}>
            <Text variant="label" style={{ fontWeight: 600 }}>
              {group.title}
            </Text>
            <Badge variant={group.key === 'overdue' ? 'danger' : group.key === 'today' ? 'primary' : 'neutral'}>{group.events.length}</Badge>
          </Flex>

          {group.events.length === 0 ? (
            <Text variant="caption" color="var(--ads-color-text-auxiliary)">
              Nenhum evento.
            </Text>
          ) : (
            <Stack gap={8}>
              {group.events.map((event) => (
                <CRMCard key={event.id}>
                  <Flex justify="space-between" align="center">
                    <Stack gap={2}>
                      <Text variant="body" style={{ fontWeight: 600 }}>
                        {event.title}
                      </Text>
                      <Text variant="caption" color="var(--ads-color-text-auxiliary)">
                        {new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}
                      </Text>
                    </Stack>
                    <Badge variant="info">{TYPE_LABEL[event.type]}</Badge>
                  </Flex>
                </CRMCard>
              ))}
            </Stack>
          )}
        </Stack>
      ))}

      {agenda.items.length === 0 && <EmptyState title="Nenhum evento agendado" description="Compromissos, retornos e lembretes aparecerão aqui." />}

      <NewAgendaModal isOpen={modal !== null} onClose={() => setModal(null)} clients={clientsQuery.data} event={modal?.event} onSubmit={handleCreate} />
    </Stack>
  );
}
