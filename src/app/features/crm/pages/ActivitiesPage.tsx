// ActivitiesPage.tsx
//
// Responsabilidade:
// Módulo Atividades completo (Sprint 33) — lista sempre em ordem
// cronológica, pesquisa, filtros (tipo/status/responsável), cadastro,
// edição e conclusão de atividade (`status → 'completed'`, um clique).

import { useMemo, useState } from 'react';
import { Stack, Flex, Text, Divider } from '@/app/primitives';
import { Loading, Button, EmptyState } from '@/design-system/components';
import { CRMCard, ActivityItem, StatusFilter, OwnerFilter, SelectFilter, FilterBar, NewActivityModal, SearchInput } from '../components';
import { useActivities } from '../hooks/useActivities';
import { useClients } from '../hooks/useClients';
import { useLocalCollection, generateId } from '../workspace';
import type { Activity, ActivityStatus, ActivityType } from '../types/Activity';
import type { ActivityFormValues } from '../components';

const TYPE_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: 'call', label: 'Ligação' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'E-mail' },
  { value: 'meeting', label: 'Reunião' },
  { value: 'task', label: 'Tarefa' },
  { value: 'visit', label: 'Visita' },
  { value: 'note', label: 'Observação' },
];

const STATUS_OPTIONS: { value: ActivityStatus; label: string }[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'completed', label: 'Concluído' },
  { value: 'canceled', label: 'Cancelado' },
];

export function ActivitiesPage() {
  const activitiesQuery = useActivities();
  const clientsQuery = useClients();
  const activities = useLocalCollection(activitiesQuery.data);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [modal, setModal] = useState<{ activity?: Activity } | null>(null);

  const loading = activitiesQuery.loading || clientsQuery.loading;

  const owners = useMemo(() => Array.from(new Set(activities.items.map((activity) => activity.ownerName).filter(Boolean))), [activities.items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return activities.items
      .filter((activity) => (!typeFilter || activity.type === typeFilter) && (!statusFilter || activity.status === statusFilter) && (!ownerFilter || activity.ownerName === ownerFilter))
      .filter((activity) => !term || activity.description.toLowerCase().includes(term) || activity.ownerName.toLowerCase().includes(term))
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [activities.items, search, typeFilter, statusFilter, ownerFilter]);

  function handleCreateOrUpdate(values: ActivityFormValues, editingId?: string) {
    if (editingId) {
      activities.update(editingId, values);
      return;
    }
    activities.add({ id: generateId('activity'), dealId: null, ...values });
  }

  function handleComplete(id: string) {
    activities.update(id, { status: 'completed' });
  }

  if (loading) {
    return <Loading label="Carregando atividades…" />;
  }

  return (
    <Stack gap={16}>
      <Flex justify="space-between" align="center" wrap gap={12}>
        <Text variant="body" style={{ fontWeight: 600 }}>
          {filtered.length} {filtered.length === 1 ? 'atividade' : 'atividades'}
        </Text>
        <Button variant="primary" size="sm" onClick={() => setModal({})}>
          Nova Atividade
        </Button>
      </Flex>

      <div style={{ maxWidth: 320 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Pesquisar por descrição ou responsável…" />
      </div>

      <FilterBar>
        <SelectFilter label="Tipo" value={typeFilter} onChange={setTypeFilter} options={TYPE_OPTIONS} allLabel="Todos os tipos" />
        <StatusFilter value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
        <OwnerFilter value={ownerFilter} onChange={setOwnerFilter} owners={owners} />
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState title="Nenhuma atividade encontrada" description="Ajuste a pesquisa ou os filtros para ver outros resultados." />
      ) : (
        <CRMCard>
          <Stack gap={4}>
            {filtered.map((activity, index) => (
              <Stack key={activity.id} gap={4}>
                <ActivityItem activity={activity} onClick={() => setModal({ activity })} onComplete={() => handleComplete(activity.id)} />
                {index < filtered.length - 1 && <Divider />}
              </Stack>
            ))}
          </Stack>
        </CRMCard>
      )}

      <NewActivityModal isOpen={modal !== null} onClose={() => setModal(null)} clients={clientsQuery.data} activity={modal?.activity} onSubmit={(values) => handleCreateOrUpdate(values, modal?.activity?.id)} />
    </Stack>
  );
}
