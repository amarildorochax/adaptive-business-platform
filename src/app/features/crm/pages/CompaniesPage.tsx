// CompaniesPage.tsx
//
// Responsabilidade:
// Módulo Empresas completo (Sprint 33) — mesmo padrão de `ClientsPage`:
// pesquisa, filtros, tabela/cartões, paginação, cadastro e detalhe.

import { useMemo, useState } from 'react';
import { Stack, Flex, Grid, Text } from '@/app/primitives';
import { Button, Loading } from '@/design-system/components';
import { CompanyCard, DataTable, StatusBadge, StatusFilter, FilterBar, NewCompanyModal } from '../components';
import type { DataTableColumn, CompanyFormValues } from '../components';
import { useCompanies } from '../hooks/useCompanies';
import { useClients } from '../hooks/useClients';
import { useDeals } from '../hooks/useDeals';
import { useNotes } from '../hooks/useNotes';
import { useHistory } from '../hooks/useHistory';
import { useLocalCollection, generateId } from '../workspace';
import { CompanyDetailPage } from './CompanyDetailPage';
import type { Company } from '../types/Company';
import type { CrmRecordStatus } from '../types/common';

const STATUS_OPTIONS: { value: CrmRecordStatus; label: string }[] = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'archived', label: 'Arquivado' },
];

type ViewMode = 'table' | 'cards';

export function CompaniesPage() {
  const companiesQuery = useCompanies();
  const clientsQuery = useClients();
  const dealsQuery = useDeals();
  const notesQuery = useNotes();
  const historyQuery = useHistory();

  const companies = useLocalCollection(companiesQuery.data);
  const notes = useLocalCollection(notesQuery.data);
  const history = useLocalCollection(historyQuery.data);

  const [view, setView] = useState<ViewMode>('cards');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ company?: Company } | null>(null);

  const loading = companiesQuery.loading || clientsQuery.loading || dealsQuery.loading || notesQuery.loading || historyQuery.loading;

  const filteredCompanies = useMemo(
    () => companies.items.filter((company) => !statusFilter || company.status === statusFilter),
    [companies.items, statusFilter],
  );

  function handleCreateOrUpdate(values: CompanyFormValues, editingId?: string) {
    const { notes: notesText, ...companyFields } = values;

    if (editingId) {
      companies.update(editingId, companyFields);
      history.add({
        id: generateId('history'),
        entityType: 'company',
        entityId: editingId,
        action: 'Empresa atualizada.',
        actor: 'Usuário Demo',
        timestamp: new Date().toISOString(),
      });
      if (notesText.trim()) {
        notes.add({ id: generateId('note'), entityType: 'company', entityId: editingId, author: 'Usuário Demo', content: notesText.trim(), createdAt: new Date().toISOString() });
      }
      return;
    }

    const id = generateId('company');
    const newCompany: Company = { id, createdAt: new Date().toISOString(), ...companyFields };
    companies.add(newCompany);
    history.add({
      id: generateId('history'),
      entityType: 'company',
      entityId: id,
      action: 'Empresa criada.',
      actor: 'Usuário Demo',
      timestamp: new Date().toISOString(),
    });
    if (notesText.trim()) {
      notes.add({ id: generateId('note'), entityType: 'company', entityId: id, author: 'Usuário Demo', content: notesText.trim(), createdAt: new Date().toISOString() });
    }
  }

  if (loading) {
    return <Loading label="Carregando empresas…" />;
  }

  const selectedCompany = selectedCompanyId ? companies.items.find((company) => company.id === selectedCompanyId) : null;

  if (selectedCompany) {
    return (
      <>
        <CompanyDetailPage
          company={selectedCompany}
          clients={clientsQuery.data.filter((client) => client.companyId === selectedCompany.id)}
          deals={dealsQuery.data.filter((deal) => deal.companyId === selectedCompany.id)}
          notes={notes.items.filter((note) => note.entityType === 'company' && note.entityId === selectedCompany.id)}
          history={history.items
            .filter((entry) => entry.entityType === 'company' && entry.entityId === selectedCompany.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())}
          onBack={() => setSelectedCompanyId(null)}
          onEdit={() => setModal({ company: selectedCompany })}
        />
        <NewCompanyModal
          isOpen={modal !== null}
          onClose={() => setModal(null)}
          company={modal?.company}
          onSubmit={(values) => handleCreateOrUpdate(values, modal?.company?.id)}
        />
      </>
    );
  }

  const columns: DataTableColumn<Company>[] = [
    { key: 'name', header: 'Nome', sortKey: 'name', render: (row) => row.name },
    { key: 'segment', header: 'Segmento', sortKey: 'segment', render: (row) => row.segment },
    { key: 'status', header: 'Status', sortKey: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'owner', header: 'Responsável', sortKey: 'ownerName', render: (row) => row.ownerName || '—' },
    { key: 'city', header: 'Cidade', sortKey: 'city', render: (row) => `${row.city}/${row.state}` },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <Button variant="neutral" size="sm" onClick={() => setSelectedCompanyId(row.id)}>
          Ver
        </Button>
      ),
    },
  ];

  return (
    <Stack gap={16}>
      <Flex justify="space-between" align="center" wrap gap={12}>
        <Text variant="body" style={{ fontWeight: 600 }}>
          {filteredCompanies.length} {filteredCompanies.length === 1 ? 'empresa' : 'empresas'}
        </Text>
        <Flex gap={8}>
          <Button variant={view === 'cards' ? 'primary' : 'neutral'} size="sm" onClick={() => setView('cards')}>
            Cartões
          </Button>
          <Button variant={view === 'table' ? 'primary' : 'neutral'} size="sm" onClick={() => setView('table')}>
            Tabela
          </Button>
          <Button variant="primary" size="sm" onClick={() => setModal({})}>
            Nova Empresa
          </Button>
        </Flex>
      </Flex>

      <FilterBar>
        <StatusFilter value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
      </FilterBar>

      {view === 'table' ? (
        <DataTable
          data={filteredCompanies}
          columns={columns}
          searchableFields={['name', 'tradeName', 'email']}
          getRowKey={(row) => row.id}
          searchPlaceholder="Pesquisar por nome, nome fantasia ou e-mail…"
          emptyTitle="Nenhuma empresa encontrada"
        />
      ) : filteredCompanies.length === 0 ? (
        <Text variant="caption" color="var(--ads-color-text-auxiliary)">
          Nenhuma empresa encontrada.
        </Text>
      ) : (
        <Grid columns={3} gap={16} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {filteredCompanies.map((company) => (
            <div key={company.id} onClick={() => setSelectedCompanyId(company.id)} style={{ cursor: 'pointer' }}>
              <CompanyCard company={company} />
            </div>
          ))}
        </Grid>
      )}

      <NewCompanyModal isOpen={modal !== null} onClose={() => setModal(null)} company={modal?.company} onSubmit={(values) => handleCreateOrUpdate(values, modal?.company?.id)} />
    </Stack>
  );
}
