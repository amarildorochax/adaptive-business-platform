// ClientsPage.tsx
//
// Responsabilidade:
// Módulo Clientes/Contatos completo (Sprint 33) — pesquisa instantânea,
// filtros (status/empresa/responsável), alternância tabela/cartões,
// paginação, contador, cadastro (`NewClientModal`) e navegação para
// `ClientDetailPage`. CRUD 100% em memória via `useLocalCollection`
// (nenhum backend, nenhuma alteração a `hooks/`/`services/` protegidos).

import { useMemo, useState } from 'react';
import { Stack, Flex, Grid, Text } from '@/app/primitives';
import { Button, Loading } from '@/design-system/components';
import { ClientCard, DataTable, StatusBadge, StatusFilter, OwnerFilter, CompanyFilter, FilterBar, NewClientModal } from '../components';
import type { DataTableColumn } from '../components';
import { useClients } from '../hooks/useClients';
import { useCompanies } from '../hooks/useCompanies';
import { useTags } from '../hooks/useTags';
import { useDeals } from '../hooks/useDeals';
import { useActivities } from '../hooks/useActivities';
import { useAgenda } from '../hooks/useAgenda';
import { useNotes } from '../hooks/useNotes';
import { useHistory } from '../hooks/useHistory';
import { useLocalCollection, generateId } from '../workspace';
import { ClientDetailPage } from './ClientDetailPage';
import type { Client, ClientStatus } from '../types/Client';
import type { Tag as TagEntity } from '../types/Tag';
import type { ClientFormValues } from '../components';

const STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'customer', label: 'Cliente' },
  { value: 'inactive', label: 'Inativo' },
];

type ViewMode = 'table' | 'cards';

export function ClientsPage() {
  const clientsQuery = useClients();
  const companiesQuery = useCompanies();
  const tagsQuery = useTags();
  const dealsQuery = useDeals();
  const activitiesQuery = useActivities();
  const agendaQuery = useAgenda();
  const notesQuery = useNotes();
  const historyQuery = useHistory();

  const clients = useLocalCollection(clientsQuery.data);
  const notes = useLocalCollection(notesQuery.data);
  const history = useLocalCollection(historyQuery.data);

  const [view, setView] = useState<ViewMode>('cards');
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ client?: Client } | null>(null);

  const loading =
    clientsQuery.loading || companiesQuery.loading || tagsQuery.loading || dealsQuery.loading || activitiesQuery.loading || agendaQuery.loading || notesQuery.loading || historyQuery.loading;

  const companyNameById = useMemo(() => new Map(companiesQuery.data.map((company) => [company.id, company.name])), [companiesQuery.data]);
  const tagById = useMemo(() => new Map(tagsQuery.data.map((tag) => [tag.id, tag])), [tagsQuery.data]);
  const owners = useMemo(
    () => Array.from(new Set(clients.items.map((client) => client.salesOwnerName).filter(Boolean))),
    [clients.items],
  );

  const filteredClients = useMemo(
    () =>
      clients.items.filter(
        (client) =>
          (!statusFilter || client.status === statusFilter) &&
          (!companyFilter || client.companyId === companyFilter) &&
          (!ownerFilter || client.salesOwnerName === ownerFilter),
      ),
    [clients.items, statusFilter, companyFilter, ownerFilter],
  );

  function handleCreateOrUpdate(values: ClientFormValues, editingId?: string) {
    if (editingId) {
      clients.update(editingId, values);
      history.add({
        id: generateId('history'),
        entityType: 'client',
        entityId: editingId,
        action: 'Cliente atualizado.',
        actor: 'Usuário Demo',
        timestamp: new Date().toISOString(),
      });
      if (values.notes.trim()) {
        notes.add({
          id: generateId('note'),
          entityType: 'client',
          entityId: editingId,
          author: 'Usuário Demo',
          content: values.notes.trim(),
          createdAt: new Date().toISOString(),
        });
      }
      return;
    }

    const id = generateId('client');
    const newClient: Client = {
      id,
      name: values.name,
      companyId: values.companyId,
      role: values.role,
      phone: values.phone,
      whatsapp: values.whatsapp,
      email: values.email,
      source: values.source,
      salesOwnerName: values.salesOwnerName,
      status: values.status,
      tagIds: values.tagIds,
      createdAt: new Date().toISOString(),
    };
    clients.add(newClient);
    history.add({
      id: generateId('history'),
      entityType: 'client',
      entityId: id,
      action: 'Cliente criado.',
      actor: 'Usuário Demo',
      timestamp: new Date().toISOString(),
    });
    if (values.notes.trim()) {
      notes.add({
        id: generateId('note'),
        entityType: 'client',
        entityId: id,
        author: 'Usuário Demo',
        content: values.notes.trim(),
        createdAt: new Date().toISOString(),
      });
    }
  }

  if (loading) {
    return <Loading label="Carregando clientes…" />;
  }

  const selectedClient = selectedClientId ? clients.items.find((client) => client.id === selectedClientId) : null;

  if (selectedClient) {
    return (
      <>
        <ClientDetailPage
          client={selectedClient}
          company={selectedClient.companyId ? companiesQuery.data.find((c) => c.id === selectedClient.companyId) : undefined}
          tags={selectedClient.tagIds.map((tagId) => tagById.get(tagId)).filter((tag) => tag !== undefined)}
          deals={dealsQuery.data.filter((deal) => deal.clientId === selectedClient.id)}
          activities={activitiesQuery.data.filter((activity) => activity.clientId === selectedClient.id)}
          agendaEvents={agendaQuery.data.filter((event) => event.clientId === selectedClient.id)}
          notes={notes.items.filter((note) => note.entityType === 'client' && note.entityId === selectedClient.id)}
          history={history.items
            .filter((entry) => entry.entityType === 'client' && entry.entityId === selectedClient.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())}
          onBack={() => setSelectedClientId(null)}
          onEdit={() => setModal({ client: selectedClient })}
        />
        <NewClientModal
          isOpen={modal !== null}
          onClose={() => setModal(null)}
          companies={companiesQuery.data}
          tags={tagsQuery.data}
          client={modal?.client}
          onSubmit={(values) => handleCreateOrUpdate(values, modal?.client?.id)}
        />
      </>
    );
  }

  const columns: DataTableColumn<Client>[] = [
    { key: 'name', header: 'Nome', sortKey: 'name', render: (row) => row.name },
    {
      key: 'company',
      header: 'Empresa',
      render: (row) => (row.companyId ? companyNameById.get(row.companyId) ?? '—' : '—'),
    },
    { key: 'status', header: 'Status', sortKey: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'owner', header: 'Responsável', sortKey: 'salesOwnerName', render: (row) => row.salesOwnerName || '—' },
    { key: 'email', header: 'E-mail', sortKey: 'email', render: (row) => row.email },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <Button variant="neutral" size="sm" onClick={() => setSelectedClientId(row.id)}>
          Ver
        </Button>
      ),
    },
  ];

  return (
    <Stack gap={16}>
      <Flex justify="space-between" align="center" wrap gap={12}>
        <Text variant="body" style={{ fontWeight: 600 }}>
          {filteredClients.length} {filteredClients.length === 1 ? 'cliente' : 'clientes'}
        </Text>
        <Flex gap={8}>
          <Button variant={view === 'cards' ? 'primary' : 'neutral'} size="sm" onClick={() => setView('cards')}>
            Cartões
          </Button>
          <Button variant={view === 'table' ? 'primary' : 'neutral'} size="sm" onClick={() => setView('table')}>
            Tabela
          </Button>
          <Button variant="primary" size="sm" onClick={() => setModal({})}>
            Novo Cliente
          </Button>
        </Flex>
      </Flex>

      <FilterBar>
        <StatusFilter value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
        <CompanyFilter value={companyFilter} onChange={setCompanyFilter} companies={companiesQuery.data} />
        <OwnerFilter value={ownerFilter} onChange={setOwnerFilter} owners={owners} />
      </FilterBar>

      {view === 'table' ? (
        <DataTable
          data={filteredClients}
          columns={columns}
          searchableFields={['name', 'email', 'phone']}
          getRowKey={(row) => row.id}
          searchPlaceholder="Pesquisar por nome, e-mail ou telefone…"
          emptyTitle="Nenhum cliente encontrado"
        />
      ) : (
        <ClientsCardsView
          clients={filteredClients}
          companyNameById={companyNameById}
          tagById={tagById}
          onSelect={setSelectedClientId}
        />
      )}

      <NewClientModal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        companies={companiesQuery.data}
        tags={tagsQuery.data}
        client={modal?.client}
        onSubmit={(values) => handleCreateOrUpdate(values, modal?.client?.id)}
      />
    </Stack>
  );
}

interface ClientsCardsViewProps {
  clients: Client[];
  companyNameById: Map<string, string>;
  tagById: Map<string, TagEntity>;
  onSelect: (id: string) => void;
}

function ClientsCardsView(props: ClientsCardsViewProps) {
  const { clients, companyNameById, tagById, onSelect } = props;

  if (clients.length === 0) {
    return (
      <Text variant="caption" color="var(--ads-color-text-auxiliary)">
        Nenhum cliente encontrado.
      </Text>
    );
  }

  return (
    <Grid columns={3} gap={16} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      {clients.map((client) => (
        <div key={client.id} onClick={() => onSelect(client.id)} style={{ cursor: 'pointer' }}>
          <ClientCard
            client={client}
            companyName={client.companyId ? companyNameById.get(client.companyId) : undefined}
            tags={client.tagIds.map((tagId) => tagById.get(tagId)).filter((tag) => tag !== undefined)}
          />
        </div>
      ))}
    </Grid>
  );
}
